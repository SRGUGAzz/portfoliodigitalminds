import { useEffect } from "react";

const N8N_WORKFLOW_URL = "https://n8n.mayrinkads.com/workflow/v4c1pkB15SpsSOXR";

export default function WorkflowViewer() {
  useEffect(() => {
    window.location.href = N8N_WORKFLOW_URL;
  }, []);

  return null;
}
