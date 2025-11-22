import type { CourseType, ModuleType } from "./types";
import type { CohortType, SessionType } from "./types";

const tonyBio: string[] = [""];

const helenBio: string[] = [""];

const membersipPaymentPrice: number = 35;

const learnings: { topic: string; content: string }[] = [
  {
    topic: "Understanding the Competition",
    content:
      "Identify and analyze your competitors to stay ahead in the game. Discover strategies for differentiating yourself in the market.",
  },
  {
    topic: "Crafting and Pitching Compelling Stories",
    content:
      "Learn how a good story can drive your success. Master techniques to enhance and deliver compelling pitches.",
  },
  {
    topic: "Building a Pragmatic Foundation",
    content:
      "Establish a solid, realistic base for your creative career. Balance creative aspirations with practical business considerations.",
  },
  {
    topic: "Monetizing Creativity and Getting Paid",
    content:
      "Explore ways to make a sustainable living from your creative talents. Understand the financial flows in the creative industry.",
  },
  {
    topic: "Financing and Distributing Projects",
    content:
      "Discover strategies for raising funds for your projects. Learn the essentials of distributing and selling your work.",
  },
  {
    topic: "Professionalism and Legal Agreements",
    content:
      "Balance your creative and business personas professionally. Learn the importance of putting agreements in writing and managing contracts.",
  },
  {
    topic: "Team Dynamics and Partnerships",
    content:
      "Understand the value of teamwork in the creative process. Discover why your collaborators are as crucial as the deal itself.",
  },
  {
    topic: "Self-Belief and Inner Voice",
    content:
      "Cultivate belief in your creative abilities and vision. Develop a keen awareness of your inner guidance.",
  },
  {
    topic: "Marketing and Building Your Profile",
    content:
      "Master the how, why, when, and what of effective marketing. Learn to build your personal and professional brand to get your projects noticed.",
  },
];

const testimonials: {
  feedback: string;
  username: string;
}[] = [
  {
    feedback:
      "Tony, you are an inspirational person who has provided our society with so much knowledge and talent. You have taught me so much about the film industry and life in general. You are a legend. Thank you for being my friend, always being out there for me, and sharing your incredible talent with us.",
    username: "Francesca Lilleystone",
  },
  {
    feedback:
      "Loved the session. Not pandering. Honestly. Exactly what I was looking for.",
    username: "Sharon Touvaino",
  },
  {
    feedback:
      "Thank you I really appreciate your input and your honesty. This class is much more than a writing class. It’s a journey into thinking, feeling, recognizing and growing as a person.",
    username: "Phil Miller",
  },
  {
    feedback:
      "The only reason I didn’t give you full marks all around was to avoid you having difficulty getting through the door with such a swollen head.",
    username: "Geoffrey Iley",
  },
  {
    feedback:
      "Firstly I would like to say how much I have learned from this course. As a complete novice who just sat down and wrote for therapy, I have now seen a creation with possibilities grow from that initial writing. I sent it to Sarah my daughter who is also a writer and filmmaker/editor and she echoed everything you said in her critique. I would never have a clue about writing without your course so if I ever have something published you are the reason. Once again thank you Tony for enlightening me on how to become an author.",
    username: "Mike Necus",
  },
];

const courses: CourseType[] = [
  {
    id: "Film",
    name: "Film Production",
    description: "Master the art of filmmaking from script to screen",
    color: "bg-blue-500",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "Introduction to filmmaking fundamentals",
        duration: "4 weeks",
        features: [
          "Basic camera techniques",
          "Story development",
          "Post-production basics",
          "Certificate of completion",
        ],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description: "Advanced production techniques and workflow",
        duration: "8 weeks",
        popular: true,
        features: [
          "Advanced cinematography",
          "Professional editing",
          "Sound design",
          "Color grading",
          "Industry mentorship",
          "Portfolio review",
        ],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Professional filmmaker mastery program",
        duration: "12 weeks",
        features: [
          "Complete production pipeline",
          "Advanced VFX",
          "Distribution strategies",
          "Industry connections",
          "Equipment access",
          "Final film screening",
        ],
      },
    ],
  },
  {
    id: "movie",
    name: "Movie Production",
    description: "Master the art of filmmaking from script to screen",
    color: "bg-blue-500",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "Introduction to filmmaking fundamentals",
        duration: "4 weeks",
        features: [
          "Basic camera techniques",
          "Story development",
          "Post-production basics",
          "Certificate of completion",
        ],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description: "Advanced production techniques and workflow",
        duration: "8 weeks",
        popular: true,
        features: [
          "Advanced cinematography",
          "Professional editing",
          "Sound design",
          "Color grading",
          "Industry mentorship",
          "Portfolio review",
        ],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Professional filmmaker mastery program",
        duration: "12 weeks",
        features: [
          "Complete production pipeline",
          "Advanced VFX",
          "Distribution strategies",
          "Industry connections",
          "Equipment access",
          "Final film screening",
        ],
      },
    ],
  },
  {
    id: "theatre",
    name: "Theatre Arts",
    description: "Develop your stage presence and acting skills",
    color: "bg-purple-500",
    status: "inactive",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "Foundation of acting and stage performance",
        duration: "6 weeks",
        features: [
          "Acting fundamentals",
          "Voice projection",
          "Stage movement",
          "Character development",
        ],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description: "Advanced acting techniques and method acting",
        duration: "10 weeks",
        popular: true,
        features: [
          "Method acting",
          "Script analysis",
          "Improvisation",
          "Stage combat",
          "Makeup basics",
          "Live performance",
        ],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Professional theatre training program",
        duration: "14 weeks",
        features: [
          "Professional coaching",
          "Industry auditions",
          "Agent connections",
          "Headshot session",
          "Reel creation",
          "Theatre showcase",
        ],
      },
    ],
  },
  {
    id: "event_management",
    name: "Event Management",
    description:
      "Master event coordination for film, acting, and directing careers.",
    color: "bg-green-800",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description:
          "Foundations for film screenings, cast/crew gatherings, and small premieres.",
        duration: "6 weeks",
        features: [
          "Event concept & budgeting",
          "Venue & logistics",
          "Basic scheduling",
          "Vendor basics",
          "Guest list & invites",
          "On-site coordination",
        ],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description:
          "Advanced management for film festivals, industry showcases, and networking.",
        duration: "10 weeks",
        popular: true,
        features: [
          "Event marketing & promotion",
          "Sponsorship acquisition",
          "Talent liaison",
          "Technical production (AV, sound)",
          "Crisis management",
          "Post-event analysis",
        ],
      },
      {
        id: "advanced",
        name: "Advanced",
        description:
          "Mastering major film premieres, awards, and bespoke artist launch events.",
        duration: "14 weeks",
        features: [
          "Complex multi-venue planning",
          "International coordination",
          "High-profile talent management",
          "Advanced budget oversight",
          "Media relations & press junkets",
          "Personal brand launch events",
        ],
      },
    ],
  },
];

// Course modules data
const courseModules: Record<string, Record<string, ModuleType[]>> = {
  movie: {
    movie_basic: [
      {
        id: "education_learning",
        title: "Education & Learning",
        description:
          "Gain essential knowledge and skills for a career in filmmaking",
        duration: "45 min",
      },
      {
        id: "networking",
        title: "Networking",
        description:
          "Build connections within the film industry to boost your career",
        duration: "60 min",
      },
      {
        id: "create_portfolio",
        title: "Create a Portfolio",
        description:
          "Develop a strong portfolio to showcase your filmmaking skills",
        duration: "50 min",
      },
      {
        id: "start_small",
        title: "Start Small",
        description:
          "Begin with small film projects to gain experience and confidence",
        duration: "75 min",
      },
      {
        id: "internships",
        title: "Internships",
        description:
          "Explore internship opportunities to kickstart your film career",
        duration: "40 min",
      },
      {
        id: "specialisation_niche",
        title: "Specialisation and Finding Your Niche in Film",
        description:
          "Identify and develop your unique niche in the film industry",
        duration: "45 min",
      },
      {
        id: "stay_current",
        title: "Stay Current with Film & TV Industry",
        description: "Keep up with trends and technologies in film and TV",
        duration: "60 min",
      },
      {
        id: "persistence_resilience",
        title: "Persistence & Resilience",
        description:
          "Build mental toughness to overcome challenges in filmmaking",
        duration: "50 min",
      },
      {
        id: "find_mentor",
        title: "Find a Mentor for Building Support for Your Film Career",
        description:
          "Seek mentors to guide and support your filmmaking journey",
        duration: "75 min",
      },
      {
        id: "utilise_online_platforms",
        title:
          "Utilise Online Platforms for Showcasing & Funding Your Film Work",
        description:
          "Leverage online platforms to showcase and fund your films",
        duration: "40 min",
      },
      {
        id: "market_yourself",
        title: "Market Yourself for Building a Creative Brand",
        description:
          "Create a personal brand to stand out in the film industry",
        duration: "45 min",
      },
      {
        id: "write",
        title: "Write",
        description:
          "Master storytelling through effective scriptwriting techniques",
        duration: "60 min",
      },
      {
        id: "be_versatile",
        title: "Be Versatile",
        description:
          "Develop a wide range of skills to adapt to various film roles",
        duration: "50 min",
      },
      {
        id: "join_unions",
        title: "Join Unions & Associations",
        description:
          "Explore benefits of joining film industry unions and associations",
        duration: "75 min",
      },
      {
        id: "move_industry_hubs",
        title: "Move to Industry Hubs",
        description: "Relocate to film industry hubs for better opportunities",
        duration: "40 min",
      },
      {
        id: "personal_projects",
        title: "Work on Personal Projects",
        description: "Create personal film projects to hone your craft",
        duration: "45 min",
      },
      {
        id: "stay_positive_patient",
        title: "Stay Positive & Patient",
        description:
          "Maintain a positive mindset and patience in your film career",
        duration: "60 min",
      },
    ],
    movie_intermediate: [
      {
        id: "education_learning",
        title: "Education & Learning",
        description:
          "Gain essential knowledge and skills for a career in filmmaking",
        duration: "45 min",
      },
      {
        id: "networking",
        title: "Networking",
        description:
          "Build connections within the film industry to boost your career",
        duration: "60 min",
      },
      {
        id: "create_portfolio",
        title: "Create a Portfolio",
        description:
          "Develop a strong portfolio to showcase your filmmaking skills",
        duration: "50 min",
      },
      {
        id: "start_small",
        title: "Start Small",
        description:
          "Begin with small film projects to gain experience and confidence",
        duration: "75 min",
      },
      {
        id: "internships",
        title: "Internships",
        description:
          "Explore internship opportunities to kickstart your film career",
        duration: "40 min",
      },
      {
        id: "specialisation_niche",
        title: "Specialisation and Finding Your Niche in Film",
        description:
          "Identify and develop your unique niche in the film industry",
        duration: "45 min",
      },
      {
        id: "stay_current",
        title: "Stay Current with Film & TV Industry",
        description: "Keep up with trends and technologies in film and TV",
        duration: "60 min",
      },
      {
        id: "persistence_resilience",
        title: "Persistence & Resilience",
        description:
          "Build mental toughness to overcome challenges in filmmaking",
        duration: "50 min",
      },
      {
        id: "find_mentor",
        title: "Find a Mentor for Building Support for Your Film Career",
        description:
          "Seek mentors to guide and support your filmmaking journey",
        duration: "75 min",
      },
      {
        id: "utilise_online_platforms",
        title:
          "Utilise Online Platforms for Showcasing & Funding Your Film Work",
        description:
          "Leverage online platforms to showcase and fund your films",
        duration: "40 min",
      },
      {
        id: "market_yourself",
        title: "Market Yourself for Building a Creative Brand",
        description:
          "Create a personal brand to stand out in the film industry",
        duration: "45 min",
      },
      {
        id: "write",
        title: "Write",
        description:
          "Master storytelling through effective scriptwriting techniques",
        duration: "60 min",
      },
      {
        id: "be_versatile",
        title: "Be Versatile",
        description:
          "Develop a wide range of skills to adapt to various film roles",
        duration: "50 min",
      },
      {
        id: "join_unions",
        title: "Join Unions & Associations",
        description:
          "Explore benefits of joining film industry unions and associations",
        duration: "75 min",
      },
      {
        id: "move_industry_hubs",
        title: "Move to Industry Hubs",
        description: "Relocate to film industry hubs for better opportunities",
        duration: "40 min",
      },
      {
        id: "personal_projects",
        title: "Work on Personal Projects",
        description: "Create personal film projects to hone your craft",
        duration: "45 min",
      },
      {
        id: "stay_positive_patient",
        title: "Stay Positive & Patient",
        description:
          "Maintain a positive mindset and patience in your film career",
        duration: "60 min",
      },
    ],
    movie_advanced: [
      {
        id: "education_learning",
        title: "Education & Learning",
        description:
          "Gain essential knowledge and skills for a career in filmmaking",
        duration: "45 min",
      },
      {
        id: "networking",
        title: "Networking",
        description:
          "Build connections within the film industry to boost your career",
        duration: "60 min",
      },
      {
        id: "create_portfolio",
        title: "Create a Portfolio",
        description:
          "Develop a strong portfolio to showcase your filmmaking skills",
        duration: "50 min",
      },
      {
        id: "start_small",
        title: "Start Small",
        description:
          "Begin with small film projects to gain experience and confidence",
        duration: "75 min",
      },
      {
        id: "internships",
        title: "Internships",
        description:
          "Explore internship opportunities to kickstart your film career",
        duration: "40 min",
      },
      {
        id: "specialisation_niche",
        title: "Specialisation and Finding Your Niche in Film",
        description:
          "Identify and develop your unique niche in the film industry",
        duration: "45 min",
      },
      {
        id: "stay_current",
        title: "Stay Current with Film & TV Industry",
        description: "Keep up with trends and technologies in film and TV",
        duration: "60 min",
      },
      {
        id: "persistence_resilience",
        title: "Persistence & Resilience",
        description:
          "Build mental toughness to overcome challenges in filmmaking",
        duration: "50 min",
      },
      {
        id: "find_mentor",
        title: "Find a Mentor for Building Support for Your Film Career",
        description:
          "Seek mentors to guide and support your filmmaking journey",
        duration: "75 min",
      },
      {
        id: "utilise_online_platforms",
        title:
          "Utilise Online Platforms for Showcasing & Funding Your Film Work",
        description:
          "Leverage online platforms to showcase and fund your films",
        duration: "40 min",
      },
      {
        id: "market_yourself",
        title: "Market Yourself for Building a Creative Brand",
        description:
          "Create a personal brand to stand out in the film industry",
        duration: "45 min",
      },
      {
        id: "write",
        title: "Write",
        description:
          "Master storytelling through effective scriptwriting techniques",
        duration: "60 min",
      },
      {
        id: "be_versatile",
        title: "Be Versatile",
        description:
          "Develop a wide range of skills to adapt to various film roles",
        duration: "50 min",
      },
      {
        id: "join_unions",
        title: "Join Unions & Associations",
        description:
          "Explore benefits of joining film industry unions and associations",
        duration: "75 min",
      },
      {
        id: "move_industry_hubs",
        title: "Move to Industry Hubs",
        description: "Relocate to film industry hubs for better opportunities",
        duration: "40 min",
      },
      {
        id: "personal_projects",
        title: "Work on Personal Projects",
        description: "Create personal film projects to hone your craft",
        duration: "45 min",
      },
      {
        id: "stay_positive_patient",
        title: "Stay Positive & Patient",
        description:
          "Maintain a positive mindset and patience in your film career",
        duration: "60 min",
      },
    ],
  },
   film: {
    film_basic: [
      {
        id: "education_learning",
        title: "Education & Learning",
        description:
          "Gain essential knowledge and skills for a career in filmmaking",
        duration: "45 min",
      },
      {
        id: "networking",
        title: "Networking",
        description:
          "Build connections within the film industry to boost your career",
        duration: "60 min",
      },
      {
        id: "create_portfolio",
        title: "Create a Portfolio",
        description:
          "Develop a strong portfolio to showcase your filmmaking skills",
        duration: "50 min",
      },
      {
        id: "start_small",
        title: "Start Small",
        description:
          "Begin with small film projects to gain experience and confidence",
        duration: "75 min",
      },
      {
        id: "internships",
        title: "Internships",
        description:
          "Explore internship opportunities to kickstart your film career",
        duration: "40 min",
      },
      {
        id: "specialisation_niche",
        title: "Specialisation and Finding Your Niche in Film",
        description:
          "Identify and develop your unique niche in the film industry",
        duration: "45 min",
      },
      {
        id: "stay_current",
        title: "Stay Current with Film & TV Industry",
        description: "Keep up with trends and technologies in film and TV",
        duration: "60 min",
      },
      {
        id: "persistence_resilience",
        title: "Persistence & Resilience",
        description:
          "Build mental toughness to overcome challenges in filmmaking",
        duration: "50 min",
      },
      {
        id: "find_mentor",
        title: "Find a Mentor for Building Support for Your Film Career",
        description:
          "Seek mentors to guide and support your filmmaking journey",
        duration: "75 min",
      },
      {
        id: "utilise_online_platforms",
        title:
          "Utilise Online Platforms for Showcasing & Funding Your Film Work",
        description:
          "Leverage online platforms to showcase and fund your films",
        duration: "40 min",
      },
      {
        id: "market_yourself",
        title: "Market Yourself for Building a Creative Brand",
        description:
          "Create a personal brand to stand out in the film industry",
        duration: "45 min",
      },
      {
        id: "write",
        title: "Write",
        description:
          "Master storytelling through effective scriptwriting techniques",
        duration: "60 min",
      },
      {
        id: "be_versatile",
        title: "Be Versatile",
        description:
          "Develop a wide range of skills to adapt to various film roles",
        duration: "50 min",
      },
      {
        id: "join_unions",
        title: "Join Unions & Associations",
        description:
          "Explore benefits of joining film industry unions and associations",
        duration: "75 min",
      },
      {
        id: "move_industry_hubs",
        title: "Move to Industry Hubs",
        description: "Relocate to film industry hubs for better opportunities",
        duration: "40 min",
      },
      {
        id: "personal_projects",
        title: "Work on Personal Projects",
        description: "Create personal film projects to hone your craft",
        duration: "45 min",
      },
      {
        id: "stay_positive_patient",
        title: "Stay Positive & Patient",
        description:
          "Maintain a positive mindset and patience in your film career",
        duration: "60 min",
      },
    ],
    film_intermediate: [
      {
        id: "education_learning",
        title: "Education & Learning",
        description:
          "Gain essential knowledge and skills for a career in filmmaking",
        duration: "45 min",
      },
      {
        id: "networking",
        title: "Networking",
        description:
          "Build connections within the film industry to boost your career",
        duration: "60 min",
      },
      {
        id: "create_portfolio",
        title: "Create a Portfolio",
        description:
          "Develop a strong portfolio to showcase your filmmaking skills",
        duration: "50 min",
      },
      {
        id: "start_small",
        title: "Start Small",
        description:
          "Begin with small film projects to gain experience and confidence",
        duration: "75 min",
      },
      {
        id: "internships",
        title: "Internships",
        description:
          "Explore internship opportunities to kickstart your film career",
        duration: "40 min",
      },
      {
        id: "specialisation_niche",
        title: "Specialisation and Finding Your Niche in Film",
        description:
          "Identify and develop your unique niche in the film industry",
        duration: "45 min",
      },
      {
        id: "stay_current",
        title: "Stay Current with Film & TV Industry",
        description: "Keep up with trends and technologies in film and TV",
        duration: "60 min",
      },
      {
        id: "persistence_resilience",
        title: "Persistence & Resilience",
        description:
          "Build mental toughness to overcome challenges in filmmaking",
        duration: "50 min",
      },
      {
        id: "find_mentor",
        title: "Find a Mentor for Building Support for Your Film Career",
        description:
          "Seek mentors to guide and support your filmmaking journey",
        duration: "75 min",
      },
      {
        id: "utilise_online_platforms",
        title:
          "Utilise Online Platforms for Showcasing & Funding Your Film Work",
        description:
          "Leverage online platforms to showcase and fund your films",
        duration: "40 min",
      },
      {
        id: "market_yourself",
        title: "Market Yourself for Building a Creative Brand",
        description:
          "Create a personal brand to stand out in the film industry",
        duration: "45 min",
      },
      {
        id: "write",
        title: "Write",
        description:
          "Master storytelling through effective scriptwriting techniques",
        duration: "60 min",
      },
      {
        id: "be_versatile",
        title: "Be Versatile",
        description:
          "Develop a wide range of skills to adapt to various film roles",
        duration: "50 min",
      },
      {
        id: "join_unions",
        title: "Join Unions & Associations",
        description:
          "Explore benefits of joining film industry unions and associations",
        duration: "75 min",
      },
      {
        id: "move_industry_hubs",
        title: "Move to Industry Hubs",
        description: "Relocate to film industry hubs for better opportunities",
        duration: "40 min",
      },
      {
        id: "personal_projects",
        title: "Work on Personal Projects",
        description: "Create personal film projects to hone your craft",
        duration: "45 min",
      },
      {
        id: "stay_positive_patient",
        title: "Stay Positive & Patient",
        description:
          "Maintain a positive mindset and patience in your film career",
        duration: "60 min",
      },
    ],
    film_advanced: [
      {
        id: "education_learning",
        title: "Education & Learning",
        description:
          "Gain essential knowledge and skills for a career in filmmaking",
        duration: "45 min",
      },
      {
        id: "networking",
        title: "Networking",
        description:
          "Build connections within the film industry to boost your career",
        duration: "60 min",
      },
      {
        id: "create_portfolio",
        title: "Create a Portfolio",
        description:
          "Develop a strong portfolio to showcase your filmmaking skills",
        duration: "50 min",
      },
      {
        id: "start_small",
        title: "Start Small",
        description:
          "Begin with small film projects to gain experience and confidence",
        duration: "75 min",
      },
      {
        id: "internships",
        title: "Internships",
        description:
          "Explore internship opportunities to kickstart your film career",
        duration: "40 min",
      },
      {
        id: "specialisation_niche",
        title: "Specialisation and Finding Your Niche in Film",
        description:
          "Identify and develop your unique niche in the film industry",
        duration: "45 min",
      },
      {
        id: "stay_current",
        title: "Stay Current with Film & TV Industry",
        description: "Keep up with trends and technologies in film and TV",
        duration: "60 min",
      },
      {
        id: "persistence_resilience",
        title: "Persistence & Resilience",
        description:
          "Build mental toughness to overcome challenges in filmmaking",
        duration: "50 min",
      },
      {
        id: "find_mentor",
        title: "Find a Mentor for Building Support for Your Film Career",
        description:
          "Seek mentors to guide and support your filmmaking journey",
        duration: "75 min",
      },
      {
        id: "utilise_online_platforms",
        title:
          "Utilise Online Platforms for Showcasing & Funding Your Film Work",
        description:
          "Leverage online platforms to showcase and fund your films",
        duration: "40 min",
      },
      {
        id: "market_yourself",
        title: "Market Yourself for Building a Creative Brand",
        description:
          "Create a personal brand to stand out in the film industry",
        duration: "45 min",
      },
      {
        id: "write",
        title: "Write",
        description:
          "Master storytelling through effective scriptwriting techniques",
        duration: "60 min",
      },
      {
        id: "be_versatile",
        title: "Be Versatile",
        description:
          "Develop a wide range of skills to adapt to various film roles",
        duration: "50 min",
      },
      {
        id: "join_unions",
        title: "Join Unions & Associations",
        description:
          "Explore benefits of joining film industry unions and associations",
        duration: "75 min",
      },
      {
        id: "move_industry_hubs",
        title: "Move to Industry Hubs",
        description: "Relocate to film industry hubs for better opportunities",
        duration: "40 min",
      },
      {
        id: "personal_projects",
        title: "Work on Personal Projects",
        description: "Create personal film projects to hone your craft",
        duration: "45 min",
      },
      {
        id: "stay_positive_patient",
        title: "Stay Positive & Patient",
        description:
          "Maintain a positive mindset and patience in your film career",
        duration: "60 min",
      },
    ],
  },
  theatre: {
    theatre_basic: [
      {
        id: "stage_manager_role",
        title: "the role of the stage manager",
        description:
          "Explores the basic duties and responsibilities of a stage manager.",
      },
      {
        id: "drama_school_application",
        title: "applying to university or drama school",
        description:
          "Guidance on applying to university or drama school programs.",
      },
      {
        id: "transferable_skills",
        title:
          "Transferrable Skills for other careers and jobs Teaching LAMDA exams",
        description:
          "An overview of skills that can be applied to other careers, including teaching.",
      },
      {
        id: "acting_character_building",
        title: "acting beginning to build your character",
        description:
          "An introduction to the fundamentals of character building.",
      },
      {
        id: "improvisation_intro",
        title: "Improvisation overview",
        description: "A general overview of improvisation techniques.",
      },
      {
        id: "funding_intro",
        title: "Applying for Funding",
        description: "An introduction to the process of applying for funding.",
      },
      {
        id: "audio_work",
        title: "Audio Work",
        description:
          "An introduction to audio work and sound design for theatre.",
      },
      {
        id: "budget_tutorial",
        title: "Budget Tutorial",
        description:
          "A basic tutorial on creating and managing theatre budgets.",
      },
      {
        id: "budgeting_rd_project",
        title: "Budgeting for a Research and Development Project",
        description:
          "Specifics on budgeting for a research and development project.",
      },
      {
        id: "careers_hair_makeup",
        title: "careers; hair and make up",
        description:
          "An overview of career paths in hair and makeup for theatre.",
      },
      {
        id: "characterization_7_questions",
        title: "Characterisation given circumstances and the 7 questions",
        description:
          "An introduction to characterization using given circumstances and the 7 questions.",
      },
      {
        id: "costume_props_budget",
        title: "costume and props; sourcing on a budget",
        description:
          "Tips for sourcing costumes and props on a limited budget.",
      },
      {
        id: "educational_theatre",
        title: "educational theatre",
        description: "Exploring opportunities in educational theatre.",
      },
      {
        id: "story_devising",
        title: "establishing the story in a scene; devising",
        description: "Techniques for establishing the story during devising.",
      },
      {
        id: "plan_drama_workshop",
        title: "how to plan a drama workshop",
        description: "A step-by-step guide to planning a drama workshop.",
      },
      {
        id: "improvisation_basics",
        title: "Improvisation Basica and fundamentals",
        description: "The basic principles and fundamentals of improvisation.",
      },
      {
        id: "get_in_get_out",
        title: "get in and get out",
        description: "A guide to the process of getting in and out of a venue.",
      },
      {
        id: "theatre_agents",
        title: "How Theatre Agents Work",
        description:
          "An explanation of the role of a theatre agent and how they work.",
      },
      {
        id: "lighting_storytelling",
        title: "Lighting as a Storytelling Tool",
        description:
          "An introduction to using lighting to enhance storytelling.",
      },
      {
        id: "production_partnership",
        title:
          "Production Partnership finding the right partners and support for your project",
        description:
          "Tips for finding the right production partners and support.",
      },
      {
        id: "theatre_finance_models",
        title: "profit share, commercial and subsidised theatre explained",
        description: "An explanation of different financial models in theatre.",
      },
      {
        id: "receiving_producing_house",
        title: "receiving house and producing house",
        description:
          "An overview of the differences between receiving and producing houses.",
      },
      {
        id: "receiving_producing_explained",
        title: "receiving house vs producing house 10 second explanations",
        description:
          "Quick, concise explanations of receiving vs. producing houses.",
      },
      {
        id: "rehearsal_and_performance",
        title: "rehearsal and performance",
        description:
          "An introduction to the rehearsal and performance process.",
        sub_module: [
          {
            id: "rehearsal_stages",
            title: "stages of a rehearsal",
            description: "A breakdown of the different stages of a rehearsal.",
          },
          {
            id: "effective_rehearsal_time",
            title: "using rehearsal time effectively",
            description:
              "Tips and strategies for making the most of rehearsal time.",
          },
        ],
      },
      {
        id: "make_a_show_intro",
        title: "So you want to make a show",
        description: "A guide for those looking to create their own show.",
        sub_module: [
          {
            id: "summary_1",
            title: "1 10 SECOND SUMMARY",
            description: "A quick 10-second summary.",
          },
          {
            id: "summary_2",
            title: "2 10 SECOND SUMMARY",
            description: "A second quick 10-second summary.",
          },
          {
            id: "summary_5",
            title: "5 10 SECOND SUMMARY",
            description: "A fifth quick 10-second summary.",
          },
          {
            id: "summary_6",
            title: "6 10 SECOND SUMMARY",
            description: "A sixth quick 10-second summary.",
          },
          {
            id: "summary_7",
            title: "7 10 SECOND SUMMARY",
            description: "A seventh quick 10-second summary.",
          },
        ],
      },
      {
        id: "sourcing_props",
        title: "Sourcing Props",
        description: "A guide to sourcing props for a production.",
      },
      {
        id: "stage_lighting_tutorial",
        title: "Stage Lighting Tutorial",
        description: "A basic tutorial on stage lighting.",
      },
      {
        id: "dress_rehearsal_purpose",
        title: "The Purpose of a Dress Rehearsal & What Happens During It",
        description: "Explains the purpose and events of a dress rehearsal.",
      },
      {
        id: "tech_rehearsal_purpose",
        title: "The Purpose of a Technical Rehearsal & What Happens During It",
        description:
          "Explains the purpose and events of a technical rehearsal.",
      },
      {
        id: "university_drama_school",
        title: "University or Drama School",
        description:
          "Information and advice about applying to university or drama school.",
      },
      {
        id: "theatre_roles",
        title: "Theatre roles explained - who does what in a show",
        description: "An overview of different roles in a theatre production.",
      },
      {
        id: "sourcing_auditions",
        title: "Where to Source Auditions",
        description: "Guidance on finding auditions.",
      },
      {
        id: "receiving_house_paid",
        title: "What is a receiving house and how are shows paid for?",
        description:
          "An explanation of receiving houses and their financial model.",
      },
      {
        id: "producing_house_paid",
        title: "What is a producing house and how are shows paid for?",
        description:
          "An explanation of producing houses and their financial model.",
      },
      {
        id: "networking_expansion",
        title: "expanding your networking",
        description: "Strategies for expanding your professional network.",
      },
      {
        id: "networking_start",
        title: "a starting point for networking",
        description: "Essential tips for beginning to network in the industry.",
      },
      {
        id: "networking",
        title: "Networking",
        description: "A comprehensive guide to effective networking.",
      },
      {
        id: "story_improvisation",
        title:
          "establishing the story; improvisation for acting and rehearsals",
        description:
          "Improvisation techniques for story and character development for all levels.",
      },
      {
        id: "dont_be_afraid_to_fail",
        title: "NSDF don't be afraid to fail",
        description:
          "Guidance on embracing failure as a part of the creative process.",
      },
      {
        id: "all_levels_improvisation_exercise",
        title: "Improvisation exercise",
        description: "An improvisation exercise for all levels.",
      },
    ],
    theatre_intermediate: [
      {
        id: "tech_rehearsal_intermediate",
        title: "The Purpose of a Technical Rehearsal & What Happens During It",
        description: "A detailed breakdown of the technical rehearsal process.",
      },
      {
        id: "character_dev_4",
        title: "How to develop a character 4",
        description:
          "Part four of the intermediate series on character development.",
      },
      {
        id: "stage_manager_intermediate",
        title: "the role of the stage manager",
        description:
          "Explores the duties and responsibilities of a stage manager at an intermediate level.",
      },
      {
        id: "portfolio_career",
        title: "a portfolio career in theatre",
        description:
          "Strategies for building and managing a diverse portfolio career in theatre.",
      },
      {
        id: "acting_intermediate",
        title: "acting",
        description: "Intermediate-level acting techniques and exercises.",
      },
      {
        id: "funding_intermediate",
        title: "Applying for Funding",
        description:
          "An intermediate look at the process of applying for funding.",
      },
      {
        id: "audio_work_intermediate",
        title: "Audio Work",
        description:
          "An introduction to audio work and sound design for theatre.",
      },
      {
        id: "budget_tutorial_intermediate",
        title: "Budget Tutorial",
        description:
          "An intermediate tutorial on creating and managing theatre budgets.",
      },
      {
        id: "budgeting_small_tour",
        title: "Budgeting for a small scale tour",
        description: "Specifics on budgeting for a small-scale theatre tour.",
      },
      {
        id: "careers_ticket_sales",
        title:
          "careers and jobs in theatre; theatre Ticket Sales Options & How the Box Office",
        description:
          "A look at careers in theatre ticket sales and box office management.",
      },
      {
        id: "costume_props",
        title: "costume and props",
        description: "Intermediate topics related to costume and props.",
        sub_module: [
          {
            id: "bespoke_costumes",
            title: "bespoke costumes",
            description: "Creating bespoke costumes for specific productions.",
          },
          {
            id: "hair_wigs",
            title: "hair styling and wigs",
            description: "Techniques for hair styling and wig use in theatre.",
          },
          {
            id: "prop_table",
            title: "the prop table",
            description:
              "Best practices for managing a prop table during a production.",
          },
          {
            id: "tips_professionals",
            title: "tips for aspiring professionals",
            description:
              "Practical tips for aspiring professionals in costume and props.",
          },
          {
            id: "training_pathways",
            title: "training and career pathways",
            description:
              "Guidance on training and career paths in costume and props.",
          },
        ],
      },
      {
        id: "staging_styles",
        title: "Different Theatre Staging Styles Explained",
        description: "Explanation of various theatre staging styles.",
      },
      {
        id: "educational_theatre_intermediate",
        title: "Educational Theatre",
        description:
          "Exploring opportunities in educational theatre at an intermediate level.",
      },
      {
        id: "freelance_vs_employed",
        title: "Freelance vs Employed Status in Theatre",
        description:
          "A detailed comparison of freelance vs. employed status in the theatre industry.",
      },
      {
        id: "theatre_roles_work",
        title: "How Theatre Roles Work",
        description:
          "An intermediate guide to understanding the various roles in theatre.",
      },
      {
        id: "character_dev_1",
        title: "How to develop a character 1",
        description:
          "Part one of the intermediate series on character development.",
      },
      {
        id: "character_dev_3",
        title: "How to develop a character 3",
        description:
          "Part three of the intermediate series on character development.",
      },
      {
        id: "character_dev_5_5",
        title: "How to develop a character 5 5",
        description:
          "Part five, sub-part five, of the intermediate series on character development.",
      },
      {
        id: "character_dev_5",
        title: "How to develop a character 5",
        description:
          "Part five of the intermediate series on character development.",
      },
      {
        id: "character_dev_6",
        title: "How to develop a character 6",
        description:
          "Part six of the intermediate series on character development.",
      },
      {
        id: "character_development",
        title: "How to develop a character",
        description:
          "An intermediate guide to the character development process.",
      },
      {
        id: "receiving_producing_intermediate",
        title: "receiving house and producing house",
        description:
          "A deeper look at the roles of receiving and producing houses.",
      },
      {
        id: "register_self_employed",
        title: "registering as self employed",
        description:
          "Steps to register as a self-employed professional in the arts.",
      },
      {
        id: "stage_lighting_intermediate",
        title: "Stage Lighting Tutorial",
        description: "An intermediate tutorial on stage lighting techniques.",
      },
      {
        id: "tour_manager_role",
        title: "the role of the tour manager",
        description:
          "Understanding the responsibilities and challenges of a tour manager.",
      },
      {
        id: "ticket_sales_box_office",
        title: "Theatre Ticket Sales Options & How the Box Office Works",
        description: "Details ticket sales options and box office operations.",
      },
      {
        id: "theatre_lighting_types",
        title: "Types of Theatre Lighting",
        description:
          "Explores different types of theatre lighting and their applications.",
      },
      {
        id: "voice_acting",
        title: "voice acting",
        description: "An introduction to voice acting techniques for theatre.",
      },
      {
        id: "production_companies",
        title: "What Are Production Companies",
        description:
          "An overview of what production companies are and their functions.",
      },
      {
        id: "community_theatre",
        title: "What Is Community Theatre",
        description: "An explanation of what community theatre is.",
      },
      {
        id: "freelancer_promotion",
        title: "Where to Promote Yourself as a Performing Arts Freelancer",
        description:
          "Tips for promoting yourself as a freelancer in the performing arts.",
      },
      {
        id: "production_team_roles",
        title: "The Production Team at a Producing House and a Receiving House",
        description:
          "An in-depth look at production teams in different types of venues.",
      },
      {
        id: "production_team_what_is",
        title: "what is a production team",
        description:
          "An overview of the roles and responsibilities within a production team.",
      },
      {
        id: "voice_acting_careers",
        title: "voice acting and careers",
        description:
          "An overview of voice acting and related career opportunities.",
      },
      {
        id: "networking_expansion",
        title: "expanding your networking",
        description: "Strategies for expanding your professional network.",
      },
      {
        id: "networking_start",
        title: "a starting point for networking",
        description: "Essential tips for beginning to network in the industry.",
      },
      {
        id: "networking",
        title: "Networking",
        description: "A comprehensive guide to effective networking.",
      },
      {
        id: "story_improvisation",
        title:
          "establishing the story; improvisation for acting and rehearsals",
        description:
          "Improvisation techniques for story and character development for all levels.",
      },
      {
        id: "dont_be_afraid_to_fail",
        title: "NSDF don't be afraid to fail",
        description:
          "Guidance on embracing failure as a part of the creative process.",
      },
    ],
    theatre_advanced: [
      {
        id: "stage_manager_advanced",
        title: "the role of the stage manager",
        description:
          "Explores the advanced duties and responsibilities of a stage manager.",
      },
      {
        id: "receiving_producing_advanced",
        title: "receiving house and producing house",
        description:
          "A deep dive into the operations of receiving and producing houses.",
      },
      {
        id: "ticket_sales_advanced",
        title: "Theatre Ticket Sales Options & How the Box Office Works",
        description:
          "Details various ticket sales options and box office operations.",
      },
      {
        id: "budget_tutorial_advanced",
        title: "Budget Tutorial",
        description:
          "An advanced tutorial on creating and managing theatre budgets.",
      },
      {
        id: "community_grants",
        title: "Community Theatre Grants",
        description:
          "Guidance on identifying and applying for grants for community theatre projects.",
      },
      {
        id: "equity",
        title: "Equity",
        description: "Understanding the role and function of the Equity union.",
      },
      {
        id: "self_employed_register_advanced",
        title:
          "How to Register as Self Employed with freelancers in theatre and the creative art",
        description:
          "Step-by-step guide to registering as a self-employed freelancer in the arts.",
      },
      {
        id: "portfolio_career_advanced",
        title: "a portfolio career in theatre",
        description:
          "Advanced strategies for building and managing a diverse portfolio career.",
      },
      {
        id: "funding_advanced",
        title: "Applying for Funding",
        description: "An advanced look at the process of applying for funding.",
      },
      {
        id: "characterisation_advanced",
        title: "Characterisation using given circumstances",
        description:
          "Advanced techniques for developing a character using given circumstances.",
      },
      {
        id: "hair_makeup_jobs",
        title: "careers; jobs in hair and make up",
        description:
          "An overview of advanced career paths in hair and makeup for theatre.",
      },
      {
        id: "staging_styles_advanced",
        title: "Different Theatre Staging Styles Explained",
        description: "Explanation of various theatre staging styles in detail.",
      },
      {
        id: "educational_theatre_advanced",
        title: "Educational Theatre",
        description:
          "Exploring advanced topics and opportunities in educational theatre.",
      },
      {
        id: "freelance_vs_employed_advanced",
        title: "Freelance vs Employed Status in Theatre",
        description:
          "A detailed comparison of freelance vs. employed status in the theatre industry.",
      },
      {
        id: "characterisation_research",
        title: "research for characterisation",
        description:
          "Techniques for in-depth research to inform character development.",
      },
      {
        id: "script_writing_advanced",
        title: "script writing",
        description:
          "An advanced look at the principles and practice of script writing.",
      },
      {
        id: "special_effects_fx",
        title: "Special Effects FX",
        description:
          "Covers the use and implementation of special effects in theatre.",
      },
      {
        id: "spotlight_promotion",
        title: "Spotlight promotion",
        description:
          "Strategies for using Spotlight for professional promotion and career advancement.",
      },
      {
        id: "tech_rehearsal_advanced",
        title: "The Purpose of a Technical Rehearsal & What Happens During It",
        description: "A detailed breakdown of the technical rehearsal process.",
      },
      {
        id: "tour_manager_advanced",
        title: "the role of the tour manager",
        description:
          "Understanding the responsibilities and challenges of a tour manager.",
      },
      {
        id: "equity_contracts",
        title: "Understanding Equity Contracts",
        description:
          "A guide to interpreting and negotiating Equity contracts.",
      },
      {
        id: "theatre_lighting_advanced",
        title: "Types of Theatre Lighting",
        description:
          "Explores different types of theatre lighting and their applications.",
      },
      {
        id: "stage_event_lighting_beginner_to_Next_Level",
        title: "Advanced Stage and Event Lighting – Beginner-to-Next-Level",
        description:
          "An advanced look at stage and event lighting techniques from beginner to next level.",
      },
      {
        id: "voice_acting_careers_advanced",
        title: "voice acting and careers",
        description:
          "An overview of advanced voice acting techniques and career opportunities.",
      },
      {
        id: "arts_council_mov",
        title: "What Is the Arts Council mov",
        description: "Explains the role and functions of the Arts Council.",
      },
      {
        id: "theatre_production_timeline",
        title: "who does what – and when during the life of theatre production",
        description:
          "A comprehensive timeline of roles and responsibilities during a production.",
      },
      {
        id: "networking_expansion",
        title: "expanding your networking",
        description: "Strategies for expanding your professional network.",
      },
      {
        id: "networking_start",
        title: "a starting point for networking",
        description: "Essential tips for beginning to network in the industry.",
      },
      {
        id: "networking",
        title: "Networking",
        description: "A comprehensive guide to effective networking.",
      },
      {
        id: "story_improvisation",
        title:
          "establishing the story; improvisation for acting and rehearsals",
        description:
          "Improvisation techniques for story and character development for all levels.",
      },
      {
        id: "dont_be_afraid_to_fail",
        title: "NSDF don't be afraid to fail",
        description:
          "Guidance on embracing failure as a part of the creative process.",
      },
    ],
  },
};

/* COHORT */
// --------------------------- COHORTS ---------------------------
const cohorts: CohortType[] = [
  {
    id: "cohort_dance",
    name: "Dance Cohort",
    description: "Master different dance styles and performance skills",
    color: "bg-pink-500",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "Introduction to dance fundamentals",
        duration: "4 weeks",
        features: ["Basic choreography", "Body conditioning", "Performance basics"],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description: "Expand dance skills and techniques",
        duration: "8 weeks",
        features: [
          "Advanced choreography",
          "Stage presence",
          "Improvisation skills",
        ],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Professional-level dance mastery",
        duration: "12 weeks",
        features: [
          "Complex choreography",
          "Live performance experience",
          "Creative direction",
        ],
      },
    ],
  },
  {
    id: "cohort_film",
    name: "Film Cohort",
    description: "Hands-on training in film production and storytelling",
    color: "bg-blue-500",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "Introduction to filmmaking",
        duration: "4 weeks",
        features: ["Storyboarding", "Camera basics", "Short film project"],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description: "Expand your filmmaking techniques",
        duration: "8 weeks",
        features: ["Editing workflow", "Lighting techniques", "Sound basics"],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Professional film production",
        duration: "12 weeks",
        features: ["Advanced cinematography", "Post-production", "Film festival prep"],
      },
    ],
  },
  {
    id: "cohort_movie",
    name: "Movie Cohort",
    description: "Deep dive into movie-making from script to screen",
    color: "bg-green-500",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "Learn the foundations of movie production",
        duration: "4 weeks",
        features: ["Scriptwriting basics", "Camera fundamentals", "Editing basics"],
      },
      {
        id: "intermediate",
        name: "Intermediate",
        description: "Intermediate-level movie production",
        duration: "8 weeks",
        features: ["Cinematography", "Sound design", "Post-production"],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Advanced professional movie-making",
        duration: "12 weeks",
        features: ["Advanced directing", "VFX", "Distribution strategies"],
      },
    ],
  },
];

// --------------------------- COHORT SESSION ---------------------------
const cohortSessions: Record<string, Record<string, SessionType[]>> = {
  cohort_dance: {
    dance_basic: [
      { id: "dance_warmup", title: "Warm-up & Conditioning", description: "Learn proper warm-up techniques for dance", duration: "30 min" },
      { id: "basic_steps", title: "Basic Steps", description: "Master foundational dance steps", duration: "45 min" },
      { id: "intro_choreography", title: "Intro Choreography", description: "Put together simple routines", duration: "60 min" },
    ],
    dance_intermediate: [
      { id: "inter_steps", title: "Intermediate Steps", description: "Learn more complex moves", duration: "50 min" },
      { id: "improv_skills", title: "Improvisation Skills", description: "Build creativity through freestyle", duration: "45 min" },
      { id: "stage_performance", title: "Stage Performance", description: "Practice performance techniques", duration: "60 min" },
    ],
    dance_advanced: [
      { id: "advanced_routines", title: "Advanced Routines", description: "Perform complex choreographies", duration: "60 min" },
      { id: "creative_direction", title: "Creative Direction", description: "Learn to design your own routines", duration: "50 min" },
      { id: "live_performance", title: "Live Performance", description: "Gain experience performing live", duration: "75 min" },
    ],
  },

  cohort_film: {
    film_basic: [
      { id: "film_intro", title: "Film Introduction", description: "Learn the basics of filmmaking", duration: "45 min" },
      { id: "camera_basics", title: "Camera Basics", description: "Understand camera equipment and techniques", duration: "60 min" },
      { id: "short_project", title: "Short Film Project", description: "Create a short film to practice skills", duration: "90 min" },
    ],
    film_intermediate: [
      { id: "editing_workflow", title: "Editing Workflow", description: "Learn intermediate editing techniques", duration: "60 min" },
      { id: "lighting_skills", title: "Lighting Skills", description: "Advanced lighting setups and techniques", duration: "50 min" },
      { id: "sound_design", title: "Sound Design", description: "Learn to record and mix audio for films", duration: "60 min" },
    ],
    film_advanced: [
      { id: "advanced_cinematography", title: "Advanced Cinematography", description: "Master camera and lens techniques", duration: "75 min" },
      { id: "post_production", title: "Post Production", description: "Editing, color grading, VFX", duration: "90 min" },
      { id: "film_festival_prep", title: "Film Festival Prep", description: "Prepare films for submission and screenings", duration: "60 min" },
    ],
  },

  cohort_movie: {
    movie_basic: [
      { id: "script_basics", title: "Scriptwriting Basics", description: "Learn how to write compelling scripts", duration: "45 min" },
      { id: "camera_intro", title: "Camera Introduction", description: "Understand basic camera work", duration: "60 min" },
      { id: "editing_intro", title: "Editing Introduction", description: "Learn simple editing techniques", duration: "50 min" },
    ],
    movie_intermediate: [
      { id: "cinematography_inter", title: "Intermediate Cinematography", description: "Explore advanced camera techniques", duration: "60 min" },
      { id: "sound_inter", title: "Sound Design Intermediate", description: "Improve audio capture and mixing skills", duration: "50 min" },
      { id: "postprod_inter", title: "Post Production Intermediate", description: "Advanced editing, color correction", duration: "60 min" },
    ],
    movie_advanced: [
      { id: "directing_adv", title: "Advanced Directing", description: "Master directing actors and crews", duration: "75 min" },
      { id: "vfx_adv", title: "VFX Techniques", description: "Learn professional visual effects", duration: "90 min" },
      { id: "distribution_adv", title: "Distribution Strategies", description: "Understand film marketing and distribution", duration: "60 min" },
    ],
  },
};

export {
  tonyBio,
  helenBio,
  membersipPaymentPrice,
  learnings,
  testimonials,
  courses,
  courseModules,
  cohorts, 
  cohortSessions,
};
