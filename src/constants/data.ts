import type { CourseType, ModuleType } from "./types";
import type { CohortType, SessionType } from "./types";

export type TonyBio = {
  name: string;
  photo: string;
  paragraphs: string[];
};

const tonyBio: TonyBio = {
  name: "Tony Klinger",
  photo: "/assets/tony.jpeg",
  paragraphs: [
    "Tony Klinger is an award-winning producer, director, and educator with decades of experience in the international film industry.",
    "He has worked with major studios and creative teams across the world and has authored several acclaimed books on filmmaking and career development.",
    "His teaching approach blends real-world knowledge with inspiring storytelling that helps creative people achieve their professional goals.",
    "Through this program, Tony empowers students to break into the industry and thrive in competitive creative environments."
  ],
};

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
    id: "movie",
    name: "Movie Production",
    description: "Master the art of filmmaking from script to screen",
    color: "bg-blue-500",
    status: "active",
    variants: [
      {
        id: "basic",
        name: "Basic",
        description: "The Basics of Movie Production",
        duration: "4 weeks",
        features: [
          "Basic camera techniques",
        ],
      },
      {
        id: "advanced",
        name: "Advanced",
        description: "Part 2: How To Get Your Movie Made!",
        duration: "8 weeks",
        popular: true,
        features: [
          "Advanced cinematography",
        ],
      }
    ],
  }
];
// Course modules data
const courseModules: Record<string, Record<string, ModuleType[]>> = {
  movie: {
    movie_basic: [
      {
        id: 'movie_basic_welcome_video',
        title: 'Welcome Video',
        description: 'Welcome to Tony Klinger Coaching Online. Watch this short welcome video.'
      },
      {
        id: 'movie_basic_course_intro',
        title: 'Course Introduction',
        description: 'In this online course, you will learn essential steps to break into the movie business, including how to build a strong portfolio, network effectively within the industry, gain hands-on experience, and persist in a competitive field through ongoing education and specialization.'
      },
      {
        id: 'movie_basic_lesson1_education_training',
        title: 'Lesson 1: Education and Training',
        description: 'In this lesson, you will explore leading film schools such as USC, NYU, and NFTS, renowned for their comprehensive programs in film production and theory. Whether pursuing formal education or alternative paths, the focus remains on cultivating skills, creativity, and industry connections vital for success in the competitive movie industry.'
      },
      {
        id: 'movie_basic_lesson2_networking',
        title: 'Lesson 2: Networking',
        description: 'In this lesson, you will learn key networking strategies for the movie industry, how to go about focusing on education, how to develope your skills, building your online presence, event attendance, finding mentorship, learning collaboration, finding internships, and persistence. These are critical for newcomers seeking to build connections and advance in filmmaking.'
      },
      {
        id: 'movie_basic_lesson3_creating_an_impressive_portfolio',
        title: 'Lesson 3: Creating An Impressive Porfolio',
        description: 'In this lesson, you will learn how create a compelling film and TV portfolio by defining focus, selecting the best work, organize effectively, showcase your skills, and highlight achievements.'
      },
      {
        id: 'movie_basic_lesson4_starting_small_in_the_industry',
        title: 'Lesson 4: Starting Small in the Industry',
        description: 'In this lesson, you will learn how to start your film and TV career from entry-level positions like production assistants or script readers. Gain skills, network effectively, and build a foundation for advancing in the industry.'
      },
      {
        id: 'movie_basic_lesson5_internships',
        title: 'Lesson 5: Internships',
        description: 'In this lesson, you will learn how internships can gain hands on experience, build you a professional network, and navigate potential drawbacks like unpaid positions and demanding hours. Discover how to find opportunities and maximize your internship experience.'
      },
      {
        id: 'movie_basic_lesson6_specialization',
        title: 'Lesson 6: Specialization',
        description: 'In this lesson, you will discover the benefits of specializing in film and TV. Learn how to gain deep knowledge, find career advancement, obtain higher earning potential, build your reputation, expand your network, find personal fulfillment, and master your chosen niche.'
      },
      {
        id: 'movie_basic_lesson7_stay_current',
        title: 'Lesson 7: Stay Current',
        description: 'In this lesson, you will learn how to stay current in the movie and tv industry through media, publications, shows and conferences, and associations and guildes you can join for exclusive insights and networking.'
      },
      {
        id: 'movie_basic_lesson8_persistence_and_resilience',
        title: 'Lesson 8: Persistence and Resilience',
        description: 'In this lesson, you will learn that persistence and resilience are crucial for newcommerse in the film and TV industry. Learn how to improve your skills continously, network effectively, embrace rejection, stay adaptable, and how to celebrate small victories in this dynamic field.'
      },
      {
        id: 'movie_basic_lesson9_find_a_mentor',
        title: 'Lesson 9: Find a Mentor',
        description: 'In this lesson, you will learn how to find a mentor and what to look for. Discover and understand your goals, research professionals, how to network, how to approach mentors respectfully, how to find and consider programs, learn industry insights, and how to establish relationships to support your career journey.'
      },
      {
        id: 'movie_basic_lesson10_utilize_online_platforms',
        title: 'Lesson 10: Utilize Online Platforms',
        description: 'In this lesson, you will learn how to use todays digital age to level you up in the film and TV industry. Understand platforms like youtube and vimeo, using crowdfunding sites to your advantage, and finding strategies for success.'
      },
      {
        id: 'movie_basic_lesson11_market_yourself',
        title: 'Lesson 11: Market Yourself',
        description: 'In this lesson, you will learn to market yourself in film by building a strong online presence, sharing engaging content, networking with industry professionals, and developing a unique personal brand.'
      },
      {
        id: 'movie_basic_lesson12_breaking_into_the_film_industry',
        title: 'Lesson 12: Breaking Into the Film Industry',
        description: 'In this lesson, you will learn essential strategies for breaking into the film industry whether that is in screenwriting or directing. Learn how to network at festivals, gain experience through assistant roles, creating your own content, understanding the business side, joining professional organizations, seeking mentorship, and continually improving your skills.'
      },
      {
        id: 'movie_basic_lesson13_be_versatile',
        title: 'Lesson 13: Be Versatile',
        description: 'In this lesson, you will learn how to diversify your skills by understanding different roles, develope technical proficiency, how to explore creativity, networking actively, gain varied experience, collaborate effectively, continue education, consider entry level positions, and build a strong portfolio. Versatility enhances your chances of success in this competitive field.'
      },
      {
        id: 'movie_basic_lesson14_join_unions_and_associations',
        title: 'Lesson 14: Join Unions and Associations',
        description: 'In this lesson, you will learn why and how you should join unions and associations for protections, resources, and how to network for success in filmmaking. Including insights to international equivalents.'
      },
      {
        id: 'movie_basic_lesson15_move_to_industry_hubs',
        title: 'Lesson 15: Move to Industry Hubs',
        description: 'In this lesson, you will learn why you should consider moving to industry hubs like LA, NYC, London, or Vancouver for access to jobs, networking, and cutting edge resources crucial for breaking into the movie business.'
      },
      {
        id: 'movie_basic_lesson16_work_on_personal_projects',
        title: 'Lesson 16: Work on Personal Projects',
        description: 'In this lesson, you will learn how and why to work on independent films or projects, series, and more to showcase your skills and style. Learn to find and utilize local resources, collaborate with others, promote on social media, and enter festivals to gain recognition and advance your career in filmmaking.'
      },
      {
        id: 'movie_basic_lesson17_stay_positive_and_patient',
        title: 'Lesson 17: Stay Positive and Patient',
        description: 'In this lesson, you will learn why you should stay positive and patient in the movie business. Set realistic goals, network actively, continue to learn, and stay resilient in the face of setbacks. These strategies and more will keep you motivated and focused on achieving success in filmmamking.'
      },
      {
        id: 'movie_basic_congratulations',
        title: 'Congratulations!',
        description: 'Congratulations on completing my online course!'
      }
    ],
    movie_advanced: [
      {
        id: 'movie_adv_welcome_how_to_get_your_movie_made',
        title: 'Welcome to "How To Get Your Movie Made"',
        description: 'In this lesson, you will learn how to break into the film industry as an independent creator. Gain insights on raising funds, distribution, and transforming your ideas into reality, along with expert advice not typically taught in traditional film schools.'
      },
      {
        id: 'movie_adv_lesson1_general_advice_for_creators',
        title: 'Lesson 1: General Advice for Creators',
        description: 'In this lesson, you will learn essential advice for creators. Staying positive, planning, self awareness, handling criticism, working with professionals, and persistence.'
      },
      {
        id: 'movie_adv_lesson2_developing_an_idea',
        title: 'Lesson 2: Developing an Idea',
        description: 'In this lesson, you will learn how to develop a screenplay idea, from idea generation and writing processes to hiring a writer and legal considerations.'
      },
      {
        id: 'movie_adv_lesson3_compromising_your_creative_vision',
        title: 'Lesson 3: Compromising Your Creative Vision',
        description: 'In this lesson, you will learn to balance external feedback with your inner voice, maintain your vision, choose collaborators wisely, and value your unique voice.'
      },
      {
        id: 'movie_adv_lesson4_reasons_for_writing',
        title: 'Lesson 4: Reasons for Writing',
        description: 'In this lesson, you will learn the motivations behind writing, strategies for getting screenplays accepted, and tips for successful submissions and career development in the film industry.'
      },
      {
        id: 'movie_adv_lesson5_common_issues_in_writing',
        title: 'Lesson 5: Common Issues in Writing',
        description: 'In this lesson, you will learn to address common writing issues such as plagiarism, fact checking, securing contracts, writing for various media, and navigating early career challenges.'
      },
      {
        id: 'movie_adv_lesson6_the_right_role_for_you',
        title: 'Lesson 6: The Right Role For you.',
        description: 'In this lesson, you will learn to identify the right role for yourself in the creative industry, from producer to director to writer, and how to align your strengths and goals with your career choice.'
      },
      {
        id: 'movie_adv_lesson7_career_from_creativity',
        title: 'Lesson 7: Career from Creativity',
        description: 'In this lesson, you will learn to balance creative passion with business skills for a sustainable career, covering financial management, reputation building, market dynamics, and flexibility.'
      },
      {
        id: 'movie_adv_lesson8_being_professional',
        title: 'Lesson 8: Being Professional',
        description: 'In this lesson, you will learn how to blend creativity with business skills, handle contracts, meet deadlines, and pitch projects effectively.'
      },
      {
        id: 'movie_adv_lesson9_sharing_ideas',
        title: 'Lesson 9: Sharing Ideas',
        description: 'In this lesson, you will learn how to balance creativity with financial planning, maintain ethics in business, and ensure transparent communication and budgeting.'
      },
      {
        id: 'movie_adv_lesson10_who_should_i_work_with',
        title: 'Lesson 10: Who should I work with?',
        description: 'In this lesson, you will learn how to choose projects wisely, collaborate effectively, and prepare thoroughly for successful creative endeavors.'
      },
      {
        id: 'movie_adv_lesson11_competition',
        title: 'Lesson 11: Competition',
        description: 'In this lesson, you will learn about your competition, who you are competing with, how to better yourself, and how to prepare for competition.'
      },
      {
        id: 'movie_adv_lesson12_agents',
        title: 'Lesson 12: Agents',
        description: 'In this lesson, you will learn the role of agent, why you should find one, how to get one, and building your portfolio with one.'
      },
      {
        id: 'movie_adv_lesson13_financing_your_film',
        title: 'Lesson 13: Financing Your Film',
        description: 'In this lesson, you will learn the importance of financing your film, how to raise money, and the steps and tips to take in order to manage your expectations.'
      },
      {
        id: 'movie_adv_lesson14_selling_your_story',
        title: 'Lesson 14: Selling Your Story',
        description: 'In this lesson, you will learn how to sell your story and ideas, understanding the industry for creativity and marketing, and how to continue to learn.'
      },
      {
        id: 'movie_adv_lesson15_the_perfect_pitch',
        title: 'Lesson 15: The Perfect Pitch',
        description: 'In this lesson, you will learn how to create, plan, and present your perfect pitch to investors with long term strategies to follow you, your story, brand, and more.'
      },
      {
        id: 'movie_adv_lesson16_understanding_the_market',
        title: 'Lesson 16: Understanding The Market',
        description: 'In this lesson, you will learn how to work within your market, compete with studios, and understand the system with industry professionals.'
      },
      {
        id: 'movie_adv_lesson17_negotiations',
        title: 'Lesson 17: Negotiations',
        description: 'In this lesson, you will learn how to negotiate, take or deny deals, understand risks, and how to become established.'
      },
      {
        id: 'movie_adv_lesson18_contracts',
        title: 'Lesson 18: Contracts',
        description: 'In this lesson, you will learn the importance of contracts, what to include, things to consider, and how still enjoy your work through all of the legal jargon.'
      },
      {
        id: 'movie_adv_lesson19_making_your_movie',
        title: 'Lesson 19: Making Your Movie',
        description: 'In this lesson, you will learn how to get your movie made and the key steps to a proposal, story development, scripts, and finances. Decide if you should manage this yourself or with an Agent.'
      },
      {
        id: 'movie_adv_lesson20_casting_actors',
        title: 'Lesson 20: Casting Actors',
        description: 'In this lesson, you will learn the steps to casting actors, who to consider, how to find them, how to market with them, and choosing the right ones.'
      },
      {
        id: 'movie_adv_congratulations',
        title: 'Congratulations!',
        description: 'Congratulations on completing my online course!'
      }
    ]
  },
};

/* COHORT */
// --------------------------- COHORTS ---------------------------
const cohorts: CohortType[] = [
  {
    id: "movie",
    name: "Live Coaching Cohort",
    description: "Master different movie-making skills and techniques",
    color: "bg-pink-500",
    status: "active",
    variants: [
      {
        id: "silver",
        name: "Silver",
        description: "Beginners Live Coaching Cohort (Silver Level)",
        duration: "24 hours",
        features: ["Eight x 3 hour live Zoom workshops"],
      },
      {
        id: "gold",
        name: "Gold",
        description: "Intermediate Live Coaching Cohort (Gold Level)",
        duration: "24 hours",
        features: [
          "Eight x 3 hour live Zoom workshops",
        ],
      },
      {
        id: "platinum",
        name: "Platinum",
        description: "Advanced Live Coaching Cohort (Platinum Level)",
        duration: "24 hours",
        features: [
          "Eight x 3 hour live Zoom workshops",
        ],
      },
      {
        id: "full_program",
        name: "Full Programme Upgrade",
        description: "Complete Live Coaching Cohort (Full Programme Upgrade)",
        duration: "72 hours",
        features: [
          "All live sessions from Silver, Gold, and Platinum levels combined",
        ],
      },
    ],
  }
];

// --------------------------- COHORT SESSION ---------------------------
const cohortSessions: Record<string, Record<string, SessionType[]>> = {
  movie: {
    silver: [
      { id: "silver_session_1",
        title: "Session One",
        description: "",
        duration: "" },
      { id: "silver_session_2",
        title: "Session Two",
        description: "",
        duration: "" },
      { id: "silver_session_3",
        title: "Session Three",
        description: "",
        duration: "" },
      { id: "silver_session_4",
        title: "Session Four",
        description: "",
        duration: "" },
      { id: "silver_session_5",
        title: "Session Five",
        description: "",
        duration: "" },
      { id: "silver_session_6",
        title: "Session Six",
        description: "",
        duration: "" },
      { id: "silver_session_7",
        title: "Session Seven",
        description: "",
        duration: "" },
      { id: "silver_session_8",
        title: "Session Eight",
        description: "",
        duration: "" },
    ],
    gold: [
      { id: "gold_session_1",
        title: "Session One",
        description: "",
        duration: "" },
      { id: "gold_session_2",
        title: "Session Two",
        description: "",
        duration: "" },
      { id: "gold_session_3",
        title: "Session Three",
        description: "",
        duration: "" },
      { id: "gold_session_4",
        title: "Session Four",
        description: "",
        duration: "" },
      { id: "gold_session_5",
        title: "Session Five",
        description: "",
        duration: "" },
      { id: "gold_session_6",
        title: "Session Six",
        description: "",
        duration: "" },
      { id: "gold_session_7",
        title: "Session Seven",
        description: "",
        duration: "" },
      { id: "gold_session_8",
        title: "Session Eight",
        description: "",
        duration: "" },
    ],
    platinum: [
      { id: "platinium_session_1",
        title: "Session One",
        description: "",
        duration: "" },
    { id: "platinium_session_2",
        title: "Session Two",
        description: "",
        duration: "" },
      { id: "platinium_session_3",
        title: "Session Three",
        description: "",
        duration: "" },
      { id: "platinium_session_4",
        title: "Session Four",
        description: "",
        duration: "" },
      { id: "platinium_session_5",
        title: "Session Five",
        description: "",
        duration: "" },
      { id: "platinium_session_6",
        title: "Session Six",
        description: "",
        duration: "" },
      { id: "platinium_session_7",
        title: "Session Seven",
        description: "",
        duration: "" },
      { id: "platinium_session_8",
        title: "Session Eight",
        description: "",
        duration: "" },
    ],
  },
}

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
