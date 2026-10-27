'use client';

import React from 'react';
import SectionHeading from './SectionHeading';
import { Book } from './ExperienceBook';

// Where I've worked: an open book with a chapter per role
const Experience = () => (
    <section id="experience" className="w-full px-5 sm:px-10 pt-20 pb-16 sm:pt-28 sm:pb-20">
        <div className="mx-auto max-w-[1360px]">
            <SectionHeading title={<>Where I’ve <em>worked</em></>} />
            <Book />
        </div>
    </section>
);

export default Experience;
