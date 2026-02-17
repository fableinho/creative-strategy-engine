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
  // Project info
  projectId: string | null;
  projectName: string;
  currentStep: number;

  // Step data
  audiences: Audience[];
  painDesires: PainDesire[];
  painDesireAudiences: PainDesireAudience[];
  messagingAngles: MessagingAngle[];
  hooks: Hook[];
  formatExecutions: FormatExecution[];

  // Loading state
  isHydrated: boolean;
  isLoading: boolean;

  // Actions
  hydrate: (projectId: string) => Promise<void>;
  reset: () => void;
  setCurrentStep: (step: number) => void;

  // Audiences
  setAudiences: (audiences: Audience[]) => void;
  addAudience: (audience: Audience) => void;
  updateAudience: (id: string, data: Partial<Audience>) => void;
  removeAudience: (id: string) => void;

  // Pain/Desires
  setPainDesires: (painDesires: PainDesire[]) => void;
  addPainDesire: (painDesire: PainDesire) => void;
  updatePainDesire: (id: string, data: Partial<PainDesire>) => void;
  removePainDesire: (id: string) => void;

  // Pain/Desire Audiences junction
  setPainDesireAudiences: (links: PainDesireAudience[]) => void;
  addPainDesireAudience: (link: PainDesireAudience) => void;
  removePainDesireAudience: (id: string) => void;

  // Messaging Angles
  setMessagingAngles: (angles: MessagingAngle[]) => void;
  addMessagingAngle: (angle: MessagingAngle) => void;
  updateMessagingAngle: (id: string, data: Partial<MessagingAngle>) => void;
  removeMessagingAngle: (id: string) => void;

  // Hooks
  setHooks: (hooks: Hook[]) => void;
  addHook: (hook: Hook) => void;
  updateHook: (id: string, data: Partial<Hook>) => void;
  removeHook: (id: string) => void;

  // Format Executions
  setFormatExecutions: (executions: FormatExecution[]) => void;
  addFormatExecution: (execution: FormatExecution) => void;
  updateFormatExecution: (id: string, data: Partial<FormatExecution>) => void;
  removeFormatExecution: (id: string) => void;
}

const initialState = {
  projectId: null as string | null,
  projectName: "",
  currentStep: 0,
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
    // Skip if already hydrated for this project
    if (get().projectId === projectId && get().isHydrated) return;

    set({ isLoading: true, projectId });

    const supabase = createClient();

    const [
      { data: project },
      { data: audiences },
      { data: painDesires },
      { data: painDesireAudiences },
      { data: messagingAngles },
      { data: hooks },
      { data: formatExecutions },
    ] = await Promise.all([
      supabase
        .from("projects")
        .select("name, metadata")
        .eq("id", projectId)
        .single(),
      supabase
        .from("audiences")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order"),
      supabase
        .from("pain_desires")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order"),
      supabase
        .from("pain_desire_audiences")
        .select("*")
        .order("sort_order"),
      supabase
        .from("messaging_angles")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order"),
      supabase
        .from("hooks")
        .select("*")
        .order("sort_order"),
      supabase
        .from("format_executions")
        .select("*")
        .order("sort_order"),
    ]);

    // Filter junction/child tables to only include items belonging to this project
    const projectPainDesireIds = new Set(
      (painDesires ?? []).map((pd) => pd.id)
    );
    const projectAngleIds = new Set(
      (messagingAngles ?? []).map((a) => a.id)
    );
    const projectHookIds = new Set(
      (hooks ?? [])
        .filter((h) => projectAngleIds.has(h.messaging_angle_id))
        .map((h) => h.id)
    );

    set({
      projectName: project?.name ?? "",
      currentStep:
        (project?.metadata as { current_step?: number } | null)
          ?.current_step ?? 0,
      audiences: audiences ?? [],
      painDesires: painDesires ?? [],
      painDesireAudiences: (painDesireAudiences ?? []).filter((pda) =>
        projectPainDesireIds.has(pda.pain_desire_id)
      ),
      messagingAngles: messagingAngles ?? [],
      hooks: (hooks ?? []).filter((h) =>
        projectAngleIds.has(h.messaging_angle_id)
      ),
      formatExecutions: (formatExecutions ?? []).filter((fe) =>
        projectHookIds.has(fe.hook_id)
      ),
      isHydrated: true,
      isLoading: false,
    });
  },

  reset: () => set(initialState),

  setCurrentStep: (step) => set({ currentStep: step }),

  // Audiences
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

  // Pain/Desires
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

  // Pain/Desire Audiences
  setPainDesireAudiences: (links) => set({ painDesireAudiences: links }),
  addPainDesireAudience: (link) =>
    set((s) => ({
      painDesireAudiences: [...s.painDesireAudiences, link],
    })),
  removePainDesireAudience: (id) =>
    set((s) => ({
      painDesireAudiences: s.painDesireAudiences.filter((l) => l.id !== id),
    })),

  // Messaging Angles
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

  // Hooks
  setHooks: (hooks) => set({ hooks }),
  addHook: (hook) => set((s) => ({ hooks: [...s.hooks, hook] })),
  updateHook: (id, data) =>
    set((s) => ({
      hooks: s.hooks.map((h) => (h.id === id ? { ...h, ...data } : h)),
    })),
  removeHook: (id) =>
    set((s) => ({ hooks: s.hooks.filter((h) => h.id !== id) })),

  // Format Executions
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
