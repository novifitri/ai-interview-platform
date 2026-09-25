import { UseFormReturn, useWatch } from "react-hook-form";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import LevelRadio from "./LevelRadio";
import { cn } from "@/lib/utils";
import type { AssessmentFormValues } from "@/pages/assessments/AssessmentNewPage";

interface SkillCardProps {
  index: number;
  id: string;
  form: UseFormReturn<AssessmentFormValues>;
  onRemove: () => void;
}

export default function SkillCard({ index, id, form, onRemove }: SkillCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const skill = useWatch({ control: form.control, name: `skills.${index}` });
  const isCustom = Boolean(skill?.is_custom || !skill?.skill_id);
  const skillLabel = skill?.skill_label || "";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "border rounded-xl bg-card p-3 sm:px-4 shadow-sm transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-border/80",
        isDragging && "opacity-50 shadow-lg ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <button
          type="button"
          className="cursor-grab text-muted-foreground/60 hover:text-foreground touch-none shrink-0"
          {...attributes}
          {...listeners}
          title="Drag to reorder priority"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            {isCustom ? (
              <div className="flex-1 max-w-sm">
                <Input
                  placeholder="Enter custom skill name (e.g. System Design)"
                  className="h-8 text-sm font-medium bg-background"
                  {...form.register(`skills.${index}.skill_label`, { required: true })}
                />
              </div>
            ) : (
              <span className="font-semibold text-sm text-foreground truncate">
                {skillLabel || "Skill"}
              </span>
            )}

            {isCustom ? (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 shrink-0">
                Custom
              </span>
            ) : skill?.skill_id ? (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-muted text-muted-foreground shrink-0">
                SK-{String(skill.skill_id).padStart(3, "0")}
              </span>
            ) : null}
          </div>
          <p className="text-xs text-muted-foreground">
            Target Competency Level for AI Evaluation
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0 sm:self-auto self-end">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-muted-foreground">Level:</span>
          <LevelRadio
            value={skill?.expected_level ?? 3}
            onChange={(v) => form.setValue(`skills.${index}.expected_level`, v)}
          />
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="p-1 rounded-md text-muted-foreground/60 hover:text-destructive hover:bg-destructive/10 transition-colors"
          aria-label="Remove skill"
          title="Remove from assessment"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
