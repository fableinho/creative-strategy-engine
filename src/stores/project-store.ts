import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import type { Tables } from "@/types/database";

type Audience = Tables<"audiences">;
type PainDesire = Tables<"pain_desires">;
type PainDesireAudience = Tables<"pain_desire_audiences">;
type MessagingAngle = Tables<"messaging_angles">;
type Hook = Tables<"hooks">;
type FormatExecution = Tables<"format_executions">;

interface ProjectState {
  projectId: string | null;
  projectName: string;
  currentStep: number;
  organizingApproach: "pain" | "desire" | null;
  audiences: Audience[];
  painDesires: PainDesire[];
  painDesireAudiences: PainDesireAudience[];
  messagingAngles: MessagingAngle[];
  hooks: Hook[];
  formatExecutions: FormatExecution[];
  isHydrated: boolean;
  isLoading: boolean;
  hydrate: (projectId: string) => Promise<void>;
  reset: () => void;
  setCurrentStep: (step: number) => void;
  setOrganizingApproach: (approach: "pain" | "desire") => void;
  setAudiences: (audiences: Audience[]) => void;
  addAudience: (audience: Audience) => void;
  updateAudience: (id: string, data: Partial<Audience>) => void;
  removeAudience: (id: string) => void;
  setPainDesires: (painDesires: PainDesire[]) => void;
  addPainDesire: (painDesire: PainDesire) => void;
  updatePainDesire: (id: string, data: Partial<PainDesire>) => void;
  removePainDesire: (id: string) => void;
  setPainDesireAudiences: (links: PainDesireAudience[]) => void;
  addPainDesireAudience: (link: PainDesireAudience) => void;
  removePainDesireAudience: (id: string) => void;
  setMessagingAngles: (angles: MessagingAngle[]) => void;
  addMessagingAngle: (angle: MessagingAngle) => void;
  updateMessagingAngle: (id: string, data: Partial<MessagingAngle>) => void;
  removeMessagingAngle: (id: string) => void;
  setHooks: (hooks: Hook[]) => void;
  addHook: (hook: Hook) => void;
  updateHook: (id: string, data: Partial<Hook>) => void;
  removeHook: (id: string) => void;
  setFormatExecutions: (executions: FormatExecution[]) => void;
  addFormatExecution: (execution: FormatExecution) => void;
  updateFormatExecution: (id: string, data: Partial<FormatExecution>) => void;
  removeFormatExecution: (id: string) => void;
}

const initialState = {
  projectId: null as string | null,
  projectName: "",
  currentStep: 0,
  organizingApproach: null as "pain" | "desire" | null,
  audiences: [] as Audience[],
  painDesires: [] as PainDesire[],
  painDesireAudiences: [] as PainDesireAudience[],
  messagingAngles: [] as MessagingAngle[],
  hooks: [] as Hook[],
  formatExecutions: [] as FormatExecution[],
  isHydrated: false,
  isLoading: false,
};

export const useProjectStore = create<ProjectState>((set, get) => ({
  ...initialState,

  hydrate: async (projectId: string) => {
    if (get().projectId === projectId && get().isHydrated) return;

    set({ isLoading: true, projectId });

    const supabase = createClient();

    const [
      { data: projectData },
      { data: audiencesData },
      { data: painDesiresData },
      { data: painDesireAudiencesData },
      { data: messagingAnglesData },
      { data: hooksData },
      { data: formatExecutionsData },
    ] = await Promise.all([
      (supabase.from("projects") as any)
        .select("name, metadata")
        .eq("id", projectId)
        .single(),
      (supabase.from("audiences") as any)
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order"),
      (supabase.from("pain_desires") as any)
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order"),
      (supabase.from("pain_desire_audiences") as any)
        .select("*")
        .order("sort_order"),
      (supabase.from("messaging_angles") as any)
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order"),
      (supabase.from("hooks") as any)
        .select("*")
        .order("sort_order"),
      (supabase.from("format_executions") as any)
        .select("*")
        .order("sort_order"),
    ]);

    const project = projectData as any;
    const audiences = (audiencesData ?? []) as Audience[];
    const painDesires = (painDesiresData ?? []) as PainDesire[];
    const painDesireAudiences = (painDesireAudiencesData ?? []) as PainDesireAudience[];
    const messagingAngles = (messagingAnglesData ?? []) as MessagingAngle[];
    const hooks = (hooksData ?? []) as Hook[];
    const formatExecutions = (formatExecutionsData ?? []) as FormatExecution[];

    const projectPainDesireIds = new Set(painDesires.map((pd) => pd.id));
    const projectAngleIds = new Set(messagingAngles.map((a) => a.id));
    const projectHookIds = new Set(
      hooks
        .filter((h) => projectAngleIds.has(h.messaging_angle_id))
        .map((h) => h.id)
    );

    const meta = project?.metadata as { current_step?: number; organizing_approach?: string } | null;

    set({
      projectName: project?.name ?? "",
      currentStep: meta?.current_step ?? 0,
      organizingApproach: (meta?.organizing_approach === "pain" || meta?.organizing_approach === "desire")
        ? meta.organizing_approach
        : null,
      audiences,
      painDesires,
      painDesireAudiences: painDesireAudiences.filter((pda) =>
        projectPainDesireIds.has(pda.pain_desire_id)
      ),
      messagingAngles,
      hooks: hooks.filter((h) => projectAngleIds.has(h.messaging_angle_id)),
      formatExecutions: formatExecutions.filter((fe) =>
        projectHookIds.has(fe.hook_id)
      ),
      isHydrated: true,
      isLoading: false,
    });
  },

  reset: () => set(initialState),

  setCurrentStep: (step) => set({ currentStep: step }),
  setOrganizingApproach: (approach) => set({ organizingApproach: approach }),

  setAudiences: (audiences) => set({ audiences }),
  addAudience: (audience) =>
    set((s) => ({ audiences: [...s.audiences, audience] })),
  updateAudience: (id, data) =>
    set((s) => ({
      audiences: s.audiences.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),
  removeAudience: (id) =>
    set((s) => ({ audiences: s.audiences.filter((a) => a.id !== id) })),

  setPainDesires: (painDesires) => set({ painDesires }),
  addPainDesire: (painDesire) =>
    set((s) => ({ painDesires: [...s.painDesires, painDesire] })),
  updatePainDesire: (id, data) =>
    set((s) => ({
      painDesires: s.painDesires.map((pd) =>
        pd.id === id ? { ...pd, ...data } : pd
      ),
    })),
  removePainDesire: (id) =>
    set((s) => ({
      painDesires: s.painDesires.filter((pd) => pd.id !== id),
    })),

  setPainDesireAudiences: (links) => set({ painDesireAudiences: links }),
  addPainDesireAudience: (link) =>
    set((s) => ({
      painDesireAudiences: [...s.painDesireAudiences, link],
    })),
  removePainDesireAudience: (id) =>
    set((s) => ({
      painDesireAudiences: s.painDesireAudiences.filter((l) => l.id !== id),
    })),

  setMessagingAngles: (angles) => set({ messagingAngles: angles }),
  addMessagingAngle: (angle) =>
    set((s) => ({ messagingAngles: [...s.messagingAngles, angle] })),
  updateMessagingAngle: (id, data) =>
    set((s) => ({
      messagingAngles: s.messagingAngles.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),
  removeMessagingAngle: (id) =>
    set((s) => ({
      messagingAngles: s.messagingAngles.filter((a) => a.id !== id),
    })),

  setHooks: (hooks) => set({ hooks }),
  addHook: (hook) => set((s) => ({ hooks: [...s.hooks, hook] })),
  updateHook: (id, data) =>
    set((s) => ({
      hooks: s.hooks.map((h) => (h.id === id ? { ...h, ...data } : h)),
    })),
  removeHook: (id) =>
    set((s) => ({ hooks: s.hooks.filter((h) => h.id !== id) })),

  setFormatExecutions: (executions) => set({ formatExecutions: executions }),
  addFormatExecution: (execution) =>
    set((s) => ({ formatExecutions: [...s.formatExecutions, execution] })),
  updateFormatExecution: (id, data) =>
    set((s) => ({
      formatExecutions: s.formatExecutions.map((fe) =>
        fe.id === id ? { ...fe, ...data } : fe
      ),
    })),
  removeFormatExecution: (id) =>
    set((s) => ({
      formatExecutions: s.formatExecutions.filter((fe) => fe.id !== id),
    })),
}));
