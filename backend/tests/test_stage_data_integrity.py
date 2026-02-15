import json
import re
from pathlib import Path


def _extract_backend_stage_ids_from_guide_data(guide_data_text: str) -> list[str]:
    backend_stage_blocks = re.findall(r"backendStageIds:\s*\[(.*?)\]", guide_data_text, re.DOTALL)
    stage_ids: list[str] = []
    for block in backend_stage_blocks:
        stage_ids.extend(re.findall(r"'([^']+)'", block))
    return stage_ids


def test_guide_backend_stage_ids_exist_in_stages_data():
    repo_root = Path(__file__).resolve().parents[2]
    guide_data_path = repo_root / "frontend" / "src" / "data" / "guideData.js"
    stages_data_path = repo_root / "backend" / "app" / "interview" / "data" / "stages_data.json"

    guide_data_text = guide_data_path.read_text(encoding="utf-8")
    guide_backend_stage_ids = _extract_backend_stage_ids_from_guide_data(guide_data_text)

    stages_data = json.loads(stages_data_path.read_text(encoding="utf-8"))
    available_stage_ids = {stage["id"] for stage in stages_data["stages"]}

    assert len(guide_backend_stage_ids) > 0, "No backendStageIds found in GUIDE_STAGES"

    missing = sorted(stage_id for stage_id in set(guide_backend_stage_ids) if stage_id not in available_stage_ids)
    assert not missing, f"GUIDE_STAGES references unknown backend stage ids: {missing}"
