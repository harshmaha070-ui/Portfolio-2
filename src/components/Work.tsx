import { useRef } from "react";
import "./styles/Work.css";
import WorkImage from "./WorkImage";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export interface ProjectItem {
  id: string;
  title: string;
  category: string;
  tools: string;
  image: string;
  link?: string;
}

const projects: ProjectItem[] = [
  {
    id: "01",
    title: "Trending Reel Editing",
    category: "Instagram Reels • Trending Edit",
    tools: "Trend Editing, Pacing, Typography",
    image: "/images/project-01-trending-reel.png",
    link: "https://www.instagram.com/p/Db2sOjKBqp_/",
  },
  {
    id: "02",
    title: "Instagram Talking Reel Editing",
    category: "Talking Head Reels",
    tools: "Clean Cuts, Captions, Retention Hooks",
    image: "/images/project-02-talking-reel.png",
    link: "https://www.instagram.com/p/DdWX0ZftAUN/",
  },
  {
    id: "03",
    title: "Festival & Event Editing",
    category: "Event & Highlight Reels",
    tools: "Color Grading, Sound Design, Beat Sync",
    image: "/images/project-03-festival-event.png",
    link: "https://www.instagram.com/p/Dc1MG_7MFVI/",
  },
  {
    id: "04",
    title: "Movie Character Introduction Edit",
    category: "Cinematic & VFX Edit",
    tools: "Speed Ramps, Transitions, Sound FX",
    image: "/images/project-04-movie-intro.png",
    link: "https://www.instagram.com/p/DX6HCE5xlox/",
  },
  {
    id: "05",
    title: "Motion Graphics & Typography Editing",
    category: "Motion Graphics & Kinetic Type",
    tools: "Kinetic Typography, Motion Design, Visual Flow",
    image: "/images/project-05-motion-typography.png",
    link: "https://www.instagram.com/p/De0mHD6Bv71/",
  },
  {
    id: "06",
    title: "Car Delivery Edits",
    category: "Automotive & Commercial Reels",
    tools: "Dynamic Cuts, Sound FX, Color Grading",
    image: "/images/project-06-car-delivery.png",
    link: "https://www.instagram.com/p/Dcm3lwhtEX7/",
  },
  {
    id: "07",
    title: "Podcast Teaser Editing",
    category: "YouTube Shorts • Podcast Teaser",
    tools: "Podcast Teaser Edit — \"Kyun Fail Hote Hain Students?\"",
    image: "/images/canva-podcast-teaser.png",
    link: "https://youtube.com/shorts/MOUv0s4DdFo?si=zo8K9UaKRjUPDAqb",
  },
  {
    id: "08",
    title: "Short Anime Animated",
    category: "Instagram Reels • Anime Edit",
    tools: "Stylized Anime Reel Edit (@typebyharsh)",
    image: "/images/canva-anime-edit.jpg",
    link: "https://www.instagram.com/reel/DWuEJyNNpUy/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "09",
    title: "God Editing",
    category: "Instagram Reels • Devotional Visuals",
    tools: "Devotional Video Edit",
    image: "/images/canva-god-editing.jpg",
    link: "https://www.instagram.com/reel/DXLH16ViNGl/?utm_source=ig_web_copy_link&igsh=MzRlODBiNWFlZA==",
  },
  {
    id: "10",
    title: "Client Video Edit 01",
    category: "Red & White Multimedia Education",
    tools: "Client Video Edits — Instagram Reel #1",
    image: "/images/canva-client-edit.jpg",
    link: "https://www.instagram.com/reel/DWjFha0DaiZ/?igsh=MTQ4OG9zaDh3cXJzaQ==",
  },
  {
    id: "11",
    title: "Client Video Edit 02",
    category: "Red & White Multimedia Education",
    tools: "Client Video Edits — Instagram Reel #2",
    image: "/images/canva-client-edit.jpg",
    link: "https://www.instagram.com/reel/DWybmpYDTQh/?igsh=dmJ1OTN6OWMzZ3E3",
  },
  {
    id: "12",
    title: "Client Video Edit 03",
    category: "Red & White Multimedia Education",
    tools: "Client Video Edits — Instagram Reel #3",
    image: "/images/canva-client-edit.jpg",
    link: "https://www.instagram.com/reel/DW6UdQjjVq1/?igsh=MTN5MGlvcnBtb3A0Nw==",
  },
  {
    id: "13",
    title: "Client Video Edit 04",
    category: "Red & White Multimedia Education",
    tools: "Client Video Edits — Instagram Reel #4",
    image: "/images/canva-client-edit.jpg",
    link: "https://www.instagram.com/reel/DW_bxo3kpN9/?igsh=MWtjdHp6MW8wdGQ3cQ==",
  },
];

const Work = () => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      // Revert any previous pin-spacer to prevent nested wrappers
      ScrollTrigger.getById("work")?.kill(true);

      const workSection = sectionRef.current;
      if (!workSection) return;
      const workFlex = workSection.querySelector(".work-flex") as HTMLElement;
      if (!workFlex) return;

      const boxes = workFlex.querySelectorAll<HTMLElement>(".work-box");
      if (!boxes.length) return;

      const mm = gsap.matchMedia();

      mm.add("(min-width: 768px)", () => {
        // Dynamically calculate horizontal travel needed to bring the last card to the center
        const getScrollAmount = () => {
          const lastBox = boxes[boxes.length - 1];
          let offsetLeft = 0;
          for (let i = 0; i < boxes.length - 1; i++) {
            offsetLeft += boxes[i].offsetWidth;
          }
          const centerOffset = Math.max(0, (window.innerWidth - lastBox.offsetWidth) / 2);
          return Math.max(0, offsetLeft - centerOffset);
        };

        const scrollDistance = () => getScrollAmount();

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: workSection,
            start: "top top",
            end: () => `+=${scrollDistance() + window.innerHeight * 0.8}`,
            scrub: 1,
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
            invalidateOnRefresh: true,
            id: "work",
          },
        });

        timeline.to(workFlex, {
          x: () => -scrollDistance(),
          ease: "none",
          duration: 1,
        });

        // Dwell period on last card centered before unpinning
        timeline.to({}, { duration: 0.35 });

        return () => {
          timeline.kill();
          ScrollTrigger.getById("work")?.kill(true);
        };
      });

      const refreshTimer = setTimeout(() => {
        ScrollTrigger.refresh();
      }, 300);

      return () => {
        clearTimeout(refreshTimer);
        mm.revert();
        ScrollTrigger.getById("work")?.kill(true);
      };
    },
    { scope: sectionRef, dependencies: [] }
  );

  return (
    <div className="work-section" id="work" ref={sectionRef}>
      <div className="work-container section-container">
        <h2>
          My <span>Work</span>
        </h2>
        <div className="work-flex">
          {projects.map((project, index) => (
            <div className="work-box" key={project.id || index}>
              <div className="work-info">
                <div className="work-title">
                  <h3>{project.id}</h3>
                  <div>
                    <h4>{project.title}</h4>
                    <p>{project.category}</p>
                  </div>
                </div>
                <h4>Tools and features</h4>
                <p>{project.tools}</p>
              </div>
              <WorkImage
                image={project.image}
                alt={project.title}
                link={project.link}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Work;
