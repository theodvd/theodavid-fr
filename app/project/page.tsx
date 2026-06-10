import { redirect } from "next/navigation";

/** /project has no index — send visitors to the Work section. */
export default function ProjectIndex() {
  redirect("/#work");
}
