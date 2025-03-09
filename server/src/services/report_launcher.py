import json
import subprocess
import threading
from pathlib import Path

import pandas as pd
from src.config import settings
from src.schemas.admin_report import ReportInput
from src.services.report_status import add_new_report_to_status, set_status


def _build_config(report_input: ReportInput) -> dict:
    def _build_hidden_properties():
        if report_input.hidden_source is None:
            return {}
        return {"source": [report_input.hidden_source]}

    comment_num = len(report_input.comments)

    config = {
        "name": report_input.input,
        "input": report_input.input,
        "question": report_input.question,
        "intro": report_input.intro,
        "model": report_input.model,
        "extraction": {
            "prompt": report_input.prompt.extraction,
            "workers": 30,
            "limit": comment_num
        },
        "hierarchical_clustering": {
            "cluster_nums": report_input.cluster,
        },
        "hierarchical_initial_labelling": {
            "prompt": report_input.prompt.initial_labelling,
            "sampling_num": 30
        },
        "hierarchical_merge_labelling": {
            "prompt": report_input.prompt.merge_labelling,
            "sampling_num": 30
        },
        "hierarchical_overview": {
            "prompt": report_input.prompt.overview
        },
        "hierarchical_aggregation": {
            "sampling_num": 30,
            "hidden_properties": _build_hidden_properties()
        }
    }
    return config


def save_config_file(report_input: ReportInput) -> Path:
    config = _build_config(report_input)
    config_path = settings.CONFIG_DIR / f"{report_input.input}.json"
    with open(config_path, "w") as f:
        json.dump(config, f, indent=4, ensure_ascii=False)
    return config_path


def save_input_file(report_input: ReportInput):
    comments = [
        {
            "comment-id": comment.id,
            "comment-body": comment.body,
            "source": comment.source
        }
        for comment in report_input.comments
    ]
    input_path = settings.INPUT_DIR / f"{report_input.input}.csv"
    df = pd.DataFrame(comments)
    df.to_csv(input_path, index=False)


def _monitor_process(process: subprocess.Popen, slug: str):
    retcode = process.wait()
    if retcode == 0:
        set_status(slug, "ready")
    else:
        set_status(slug, "error")


def launch_report_generation(report_input: ReportInput) -> str:
    """
    外部ツールの main.py を subprocess で呼び出してレポート生成処理を開始する関数。
    """

    try:
        add_new_report_to_status(report_input)
        config_path = save_config_file(report_input)
        save_input_file(report_input)
        cmd = [
            "python",
            "hierarchical_main.py",
            config_path,
            "--skip-interaction",
            "--without-html"
        ]
        execution_dir = settings.TOOL_DIR / "pipeline"
        process = subprocess.Popen(cmd, cwd=execution_dir)
        threading.Thread(target=_monitor_process, args=(process, report_input.input), daemon=True).start()
    except Exception as e:
        set_status(report_input.input, "error")
        raise e
