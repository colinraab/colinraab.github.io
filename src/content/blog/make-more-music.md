---
title: "Make More Music"
description: "Summary of the Make More Music project."
pubDate: 2025-10-15
updatedDate: 2025-10-15
tags:
  - Node.js
  - React
  - Electron
heroImage: "https://res.cloudinary.com/dn8qfu68i/image/upload/v1760745592/makemoremusic_cover_rwsxqk.png"
minutesRead: 6
---
"Personalized song-writing and production inspiration with a click."

Approaching music creation with an musician-first, AI empowered mentality.

Watch the video to see it in action.

<div class="video-embed" style="position: relative; padding-bottom: 56.25%; height: 0; overflow: hidden; border-radius: 18px; box-shadow: 0 20px 40px rgba(12, 18, 32, 0.25); border: 1px solid rgba(255, 255, 255, 0.08);">
  <iframe
    src="https://www.youtube-nocookie.com/embed/9_IuSvs29U4?rel=0&modestbranding=1"
    title="Make More Music demo"
    loading="lazy"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    allowfullscreen
    referrerpolicy="strict-origin-when-cross-origin"
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: 0;"
  ></iframe>
</div>

## Project Overview

- **Context:** Personal project developed between April and July 2025
- **Deliverables:** Desktop application (Mac and Windows)
- **Sources:** Uses Gemini 2.5 Flash and Lyria 2 models from Google

## Motivation
As mentioned in the video, I myself struggle with the nearly infinite sonic possibilities available in an empty Ableton project. I'm stymied when I stare at my computer screen hoping for inspiration; literally, (any other time) when I'm away from my computer will the music flow freely between my ears! Make More Music was born from this constraint, to have a songwriting companion only a click away.

## Background & Research
Earlier in 2025, prior to this project, I was working on another personal app called "ReDisc". The goal was to run local audio analysis on my library of music in order to build a playlist system akin to Spotify. During that project, I realized that simply uploading raw audio to Gemini and asking it for features like genre and mood proved much more accurate than specialized CNN classifiers. This led to exploration of audio understanding by LLMs, which in turn became my thesis about music information retrieval. In addition, I was inspired to create Make More Music as I sought avenues where AI could support musicians, rather than replace them. 

## Building Make More Music
I love making tools for music. After developing my fair share of software synthesizers and effects, however, I honestly think there are simply enough plugins already out there. Really. How many compressors does a producer actually need? I have enjoyed building plugins, and would happily do so again in the future, I just lack faith in the market need for additional derivative toys. 

Make More Music represents a broadening of my focus and skillset to adjacent tools for musicians. 

## Interface & Demo
I designed the main page of the app to be as simple as possible. I also have a penchant for graph interfaces. The goal was to streamline the average interaction (creating a song idea) to be only a few clicks (choose a genre, hit generate). 

I drew visual inspiration from the work of [enigmatriz](https://x.com/enigmatriz). I enjoy his tasteful integration of ASCII and traditional art with pleasing color palettes. 

## Development Lessons
I utilized Claude and Gemini when writing the code for this project. I use Node.js and React for my work with Aurmor.ai, and this was my first time using them, along with Electron, for a personal project. 

AI development tools are a double-edged sword. I began software development in high school for three reasons: I liked computers, I wanted to make cool things, and I wanted career security. LLM-powered coding agents enable me to create tools and apps at a scale and pace that is remarkable. Nonethless, I am grateful in retrospect for the years and years of foundational software learning in languages like C++, Java and Python. 

When using AI for coding, there is still lots of learning that happens along the way, but the learning is broader in scope and as we know, the devil's in the details. Each AI project leaves me with knowledge and enthusiasm to make the next one better, but if I'm not careful, the AI-generated problems can snowball.  Make More Music accumulated a variety of issues during its cycle that could've been avoided with proper automated testing and other sustainable development practices. I am learning such 'development hygiene' as I go from books, videos, and trial and error. For my future projects, I have also been learning how to design distributed systems and writing proper architecture documents. 

## Go To Market?
Over the summer, I joined the [McGill Engine](https://www.mcgill.ca/engine/about-us) program, a startup incubator on campus for proactive students usually in STEM. I loved my enlightening meetings with mentor Andrew Csinger (thanks!) and took an entrepreneurship online course. Our conversations helped me realize the importance of developing software that solves real pain points, validating product-market fit early in the development cycle, and spending more up front time planning rather than executing. To be fair, Make More Music was always a passion project and financial viability was never the goal. By the end of our time together, I realized that Make More Music had some potential avenues (such as licenses to educational institutions), but was inadequately positioned for commercialization. And that's OK!

I've kept Make More Music closed-source while I was exploring its profitability, but I will most likely open-source it in the near future. 

## Challenges & Future Work
As a hardcore Ableton enthusiast, I wanted the ability to generate entire Ableton projects from the parameters specified in the Make More Music output. Ableton project files (.als) are effectively zip files containing a monstrous XML file that outlines every track, insert, and setting. In order to build my own XML, I needed to parse and understand the structure of these files, determine the naming conventions, and translate the output from the Gemini response into recognizable entries. This process was tedious, lengthy, and only partially successful. 

I was able to create projects with the desired:
- Project Name
- Tempo
- Key
- Number of tracks
- Names of tracks

I was unable to properly create instruments or devices on those tracks in the time I had available. By this point in development, my focus had shifted towards my thesis and managing my remaining time in Montreal. As a final effort, I looked at the [Ableton MCP](https://github.com/ahujasid/ableton-mcp), but found it incompatible with my current stack. 

In general, the majority of the core functionality I envisioned was completed and implemented. The consistency and quality of Gemini's responses, however, left room for improvement. Since Make More Music was my first AI-powered application, I had a lot to learn about prompting strategies and formatting. 

In hindsight, it would've been more important to focus on tuning the AI responses rather than implementing more features. The quality of the ideas are the most important aspect of this app, and everything else is secondary, yet my motivations inverted the two. I was too excited to build out features like audio drag-and-drop or Ableton project creation rather than thoroughly solve the core problem. 