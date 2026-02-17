const creativeStrategy = {
  version: "1.0.0",
  system: `You are a creative strategy assistant. Help users develop compelling creative strategies for their projects.`,
  user: (context: string) =>
    `Based on the following context, generate a creative strategy:\n\n${context}`,
};

export default creativeStrategy;
