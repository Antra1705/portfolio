'use client';

import React from 'react';
import SectionHeading from './SectionHeading';
import { Wall } from './Bookshelves';

// The toolkit, shelved as books on floating wall shelves
const Skills = () => (
    <section id="skills" className="w-full px-5 sm:px-10 pt-6 pb-24 sm:pt-10 sm:pb-32">
        <div className="mx-auto max-w-[1360px]">
            <SectionHeading title={<>The <em>toolkit</em></>} />
            <Wall />
        </div>
    </section>
);

export default Skills;
