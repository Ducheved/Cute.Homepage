import React, { createContext, useState, useEffect, ReactNode } from "react";

import { fetchProjects } from "../actions/projectActions";
import { ProjectGroup, Project } from "../types";

export interface AppContextType {
  projects: ProjectGroup[];
  modalContent: Project | null;
  handleReadMore: (project: Project) => void;
  closeModal: () => void;
}

interface AppProviderProps {
  children: ReactNode;
}

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [projects, setProjects] = useState<ProjectGroup[]>([]);
  const [modalContent, setModalContent] = useState<Project | null>(null);

  useEffect(() => {
    fetchProjects(setProjects);
  }, []);

  const handleReadMore = (project: Project) => {
    setModalContent(project);
  };

  const closeModal = () => {
    setModalContent(null);
  };

  return (
    <AppContext.Provider
      value={{ projects, modalContent, handleReadMore, closeModal }}
    >
      {children}
    </AppContext.Provider>
  );
};
