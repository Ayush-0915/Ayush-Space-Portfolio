import { FaWhatsapp } from "react-icons/fa";
import {
  RxGithubLogo,
  RxInstagramLogo,
  RxLinkedinLogo,
} from "react-icons/rx";

export const SKILL_DATA = [
  {
    skill_name: "Python",
    image: "python.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "TensorFlow",
    image: "tensorflow.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "PyTorch",
    image: "pytorch.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Scikit-learn",
    image: "scikitlearn.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Pandas",
    image: "pandas.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "NumPy",
    image: "numpy.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Jupyter",
    image: "jupyter.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Hugging Face",
    image: "huggingface.svg",
    width: 80,
    height: 80,
  },
] as const;

export const SOCIALS = [
  {
    name: "Instagram",
    icon: RxInstagramLogo,
    link: "https://www.instagram.com/ayush_xo._/",
  },
  {
    name: "WhatsApp",
    icon: FaWhatsapp,
    link: "https://wa.me/919589981849?text=Hi%20Ayush%2C%20I%20visited%20your%20portfolio%20and%20want%20to%20connect.",
  },
  {
    name: "Linkedin",
    icon: RxLinkedinLogo,
    link: "https://www.linkedin.com/in/ayush-singh-0915ap",
  },
  {
    name: "GitHub",
    icon: RxGithubLogo,
    link: "https://github.com/Ayush-0915",
  },
] as const;

export const FRONTEND_SKILL = [
  {
    skill_name: "Matplotlib",
    image: "matplotlib.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Seaborn",
    image: "seaborn.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Streamlit",
    image: "streamlit.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "FastAPI",
    image: "fastapi.svg",
    width: 80,
    height: 80,
  },
] as const;

export const BACKEND_SKILL = [
  {
    skill_name: "Docker",
    image: "docker.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "MongoDB",
    image: "mongodb.svg",
    width: 80,
    height: 80,
  },
] as const;

export const FULLSTACK_SKILL = [
  {
    skill_name: "AWS",
    image: "aws.svg",
    width: 80,
    height: 80,
  },
  {
    skill_name: "Google Cloud",
    image: "gcp.svg",
    width: 80,
    height: 80,
  },
] as const;

export const OTHER_SKILL = [
  {
    skill_name: "Prompt Engineering",
    image: "prompt.svg",
    width: 80,
    height: 80,
  },
] as const;

export type ProjectItem = {
  readonly title: string;
  readonly category: string;
  readonly description: string;
  readonly image: string;
  readonly link: string;
  readonly githubUrl: string;
  readonly liveDemoUrl?: string | null;
  readonly completedDate: string;
  readonly status: "Completed" | "AI Prototype" | "Live Experience";
  readonly technologies: readonly string[];
};

export const PROJECTS: readonly ProjectItem[] = [
  {
    title: "Car Evaluation Classifier",
    category: "Machine Learning & Classification",
    description:
      "A machine learning system that predicts vehicle acceptability using a Decision Tree classifier (Gini Index). Evaluates key attributes including safety ratings, maintenance cost, and passenger capacity with a verified 82% accuracy, visualized in Power BI.",
    image: "/projects/car-evaluation.png",
    link: "https://github.com/Ayush-0915/Car-evaluation",
    githubUrl: "https://github.com/Ayush-0915/Car-evaluation",
    liveDemoUrl: null,
    completedDate: "April 2026",
    status: "Completed",
    technologies: [
      "Python",
      "Scikit-learn",
      "Decision Tree",
      "Power BI",
      "Pandas",
      "NumPy",
    ],
  },
  {
    title: "Personal 3D Space Portfolio",
    category: "Interactive 3D & Web Graphics",
    description:
      "A visually immersive personal portfolio web experience featuring interactive 3D celestial scenes, custom shaders, smooth entrance animations, and responsive layout to showcase technical AI/ML projects and credentials.",
    image: "/projects/personal-3d-v2.png",
    link: "https://github.com/Ayush-0915/Space-Portfolio",
    githubUrl: "https://github.com/Ayush-0915/Space-Portfolio",
    liveDemoUrl: "https://ayush-0915.github.io/Personal-3D-Portfolio/",
    completedDate: "April 2026",
    status: "Live Experience",
    technologies: [
      "Three.js",
      "React",
      "Next.js",
      "Tailwind CSS",
      "Framer Motion",
      "WebGL",
    ],
  },
  {
    title: "Uber Trip Insights Dashboard",
    category: "Operational Analytics & BI",
    description:
      "An interactive urban mobility analytics dashboard tracking ride demand spikes, peak travel windows, and regional dispatch hotspots for smarter operational decisions, fare pattern discovery, and fleet management.",
    image: "/projects/uber.jpg",
    link: "https://github.com/Ayush-0915/Uber-Data-Analysis",
    githubUrl: "https://github.com/Ayush-0915/Uber-Data-Analysis",
    liveDemoUrl: null,
    completedDate: "January 2026",
    status: "Completed",
    technologies: [
      "Python",
      "Power BI",
      "Pandas",
      "Data Cleaning",
      "Data Visualization",
    ],
  },
  {
    title: "Tips Data Analysis & Modeling",
    category: "Statistical EDA & Analytics",
    description:
      "An end-to-end exploratory data analysis project investigating restaurant tipping behavior, evaluating correlations across total bill amounts, party size, dining periods, and service context to derive practical business insights.",
    image: "/projects/tips-data-analysis.jpg",
    link: "https://github.com/Ayush-0915/Tips-Data-Analysis",
    githubUrl: "https://github.com/Ayush-0915/Tips-Data-Analysis",
    liveDemoUrl: null,
    completedDate: "November 2025",
    status: "Completed",
    technologies: [
      "Python",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Statistical EDA",
    ],
  },
  {
    title: "Shifra 2.0 AI Assistant",
    category: "Conversational AI & Speech",
    description:
      "An AI-powered desktop conversational voice assistant combining Speech-to-Text, Google Gemini API for intelligent contextual dialogue reasoning, and real-time speech synthesis for hands-free productivity.",
    image: "/projects/shifra.jpg",
    link: "https://github.com/Ayush-0915/Shifra-2.O",
    githubUrl: "https://github.com/Ayush-0915/Shifra-2.O",
    liveDemoUrl: null,
    completedDate: "July 2025",
    status: "AI Prototype",
    technologies: [
      "Python",
      "Google Gemini API",
      "SpeechRecognition",
      "pyttsx3",
      "NLP",
    ],
  },
  {
    title: "Netflix Data Analysis Dashboard",
    category: "Exploratory Data Analysis & BI",
    description:
      "An interactive exploratory data analysis project and Power BI dashboard uncovering content catalog dynamics across Netflix movies and TV shows, tracking genre trends, release trajectories, and regional market distribution.",
    image: "/projects/netflix-dashboard-v2.png",
    link: "https://github.com/Ayush-0915/Netflix-Data-Analysis",
    githubUrl: "https://github.com/Ayush-0915/Netflix-Data-Analysis",
    liveDemoUrl: null,
    completedDate: "June 2025",
    status: "Completed",
    technologies: [
      "Python",
      "Pandas",
      "Matplotlib",
      "Seaborn",
      "Power BI",
      "EDA",
    ],
  },
] as const;

export const FOOTER_DATA = [
  {
    title: "Community",
    data: [
      {
        name: "GitHub",
        icon: RxGithubLogo,
        link: "https://github.com/Ayush-0915",
      },
    ],
  },
  {
    title: "Social Media",
    data: [
      {
        name: "Instagram",
        icon: RxInstagramLogo,
        link: "https://www.instagram.com/ayush_xo._/",
      },
      {
        name: "Linkedin",
        icon: RxLinkedinLogo,
        link: "https://www.linkedin.com/in/ayush-singh-0915ap",
      },
      {
        name: "GitHub",
        icon: RxGithubLogo,
        link: "https://github.com/Ayush-0915",
      },
    ],
  },
  {
    title: "About",
    data: [
      {
        name: "Contact Me",
        icon: null,
        link: "mailto:ayushofficaluse@gmail.com",
      },
      {
        name: "WhatsApp",
        icon: FaWhatsapp,
        link: "https://wa.me/919589981849?text=Hi%20Ayush%2C%20I%20visited%20your%20portfolio%20and%20want%20to%20connect.",
      },
    ],
  },
] as const;

export const NAV_LINKS = [
  {
    title: "About me",
    link: "#about-me",
  },
  {
    title: "Skills",
    link: "#skills",
  },
  {
    title: "Projects",
    link: "#projects",
  },
  {
    title: "Experience",
    link: "#experience",
  },
  {
    title: "Certificates",
    link: "#certificates",
  },
] as const;

export const LINKS = {
  sourceCode: "https://github.com/sanidhyy/space-portfolio",
};
