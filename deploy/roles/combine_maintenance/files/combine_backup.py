#!/usr/bin/env python3
"""Create a backup of TheCombine and push the file to AWS S3 service."""

import argparse
from datetime import datetime
import json
import logging
import os
from pathlib import Path
import sys
import tarfile
import tempfile
from typing import Dict

from maint_utils import run_cmd
from script_step import ScriptStep


def parse_args() -> argparse.Namespace:
    """Define command line arguments for parser."""
    parser = argparse.ArgumentParser(
        description="Backup TheCombine database and backend files and push to AWS S3 bucket.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    parser.add_argument(
        "--verbose", action="store_true", help="Print intermediate values to aid in debugging"
    )
    default_config = Path(__file__).resolve().parent / "backup_conf.json"
    parser.add_argument("--config", help="backup configuration file.", default=default_config)
    return parser.parse_args()


def main() -> None:
    """Create a backup of TheCombine database and backend files."""
    args = parse_args()
    config: Dict[str, str] = json.loads(args.config.read_text())
    if args.verbose:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.INFO)
    else:
        logging.basicConfig(format="%(levelname)s:%(message)s", level=logging.WARNING)

    step = ScriptStep()

    step.print("Prepare the backup directory.")
    with tempfile.TemporaryDirectory() as backup_dir:
        backup_file = "combine-backup.tar.gz"
        date_str = datetime.now().strftime("%Y-%m-%d-%H-%M-%S")
        aws_file = f"{config['aws_bucket']}/{config['combine_host']}-{date_str}.tar.gz"
        # turn off the color coding for docker-compose output - adds unreadable escape
        # characters to syslog
        compose_opts = "--no-ansi"
        compose_file = Path(config["docker_compose_file"])

        step.print("Stop the frontend and certmgr containers.")
        run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                compose_opts,
                "stop",
                "--timeout",
                "0",
                "frontend",
                "certmgr",
            ]
        )

        step.print("Dump the database.")
        run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                compose_opts,
                "exec",
                "-T",
                "database",
                "/usr/bin/mongodump",
                "--db=CombineDatabase",
                "--gzip",
            ]
        )

        check_backup_results = run_cmd(
            [
                "docker-compose",
                "-f",
                str(compose_file),
                "exec",
                "-T",
                "database",
                "ls",
                config["db_files_subdir"],
            ],
            check_results=False,
        )
        if check_backup_results.returncode != 0:
            print("No database backup file - most likely empty database.", file=sys.stderr)
            sys.exit(0)

        db_container = run_cmd(
            ["docker", "ps", "--filter", "name=database", "--format", "{{.Names}}"]
        ).stdout.strip()
        run_cmd(
            [
                "docker",
                "cp",
                f"{db_container}:{config['db_files_subdir']}/",
                backup_dir,
            ]
        )

        step.print("Copy the backend files.")
        backend_container = run_cmd(
            ["docker", "ps", "--filter", "name=backend", "--format", "{{.Names}}"]
        ).stdout.strip()
        run_cmd(
            [
                "docker",
                "cp",
                f"{backend_container}:/home/app/{config['backend_files_subdir']}/",
                str(backup_dir),
            ]
        )

        step.print("Create the tarball for the backup.")
        # cd to backup_dir so that files in the tarball are relative to the backup_dir
        os.chdir(backup_dir)

        with tarfile.open(backup_file, "x:gz") as tar:
            for name in (config["backend_files_subdir"], config["db_files_subdir"]):
                tar.add(name)

        step.print("Push backup to AWS S3 storage.")
        #    need to specify full path because $PATH does not contain
        #    /usr/local/bin when run as a cron job
        run_cmd(
            [
                "aws",
                "s3",
                "cp",
                backup_file,
                aws_file,
                "--profile",
                config["aws_s3_profile"],
            ]
        )

    step.print("Restart the frontend and certmgr containers.")
    run_cmd(
        ["docker-compose", "-f", str(compose_file), compose_opts, "start", "certmgr", "frontend"]
    )


if __name__ == "__main__":
    main()
