import { FaReact, FaNodeJs, FaPython, FaJava, FaDocker } from "react-icons/fa";
import {
  SiTypescript,
  SiJavascript,
  SiMongodb,
  SiPostgresql,
  SiTailwindcss,
  SiFastify,
  SiVite,
} from "react-icons/si";

export const iconMap: { [key: string]: JSX.Element } = {
  react: <FaReact />,
  nodejs: <FaNodeJs />,
  python: <FaPython />,
  java: <FaJava />,
  docker: <FaDocker />,
  typescript: <SiTypescript />,
  javascript: <SiJavascript />,
  mongodb: <SiMongodb />,
  postgresql: <SiPostgresql />,
  tailwindcss: <SiTailwindcss />,
  ts: <SiTypescript />,
  js: <SiJavascript />,
  fastify: <SiFastify />,
  vite: <SiVite />,
};
