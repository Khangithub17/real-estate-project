import React from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  HiOfficeBuilding, 
  HiUsers, 
  HiLightBulb, 
  HiHeart,
  HiAcademicCap,
  HiGlobeAlt,
  HiTrendingUp,
  HiShieldCheck
} from 'react-icons/hi';
import { FaAward, FaHandshake, FaUsers, FaStar } from 'react-icons/fa';

const About = () => {
  const [heroRef, heroInView] = useInView({ threshold: 0.1 });
  const [storyRef, storyInView] = useInView({ threshold: 0.1 });
  const [valuesRef, valuesInView] = useInView({ threshold: 0.1 });
  const [teamRef, teamInView] = useInView({ threshold: 0.1 });
  const [achievementsRef, achievementsInView] = useInView({ threshold: 0.1 });

  const values = [
    {
      icon: HiShieldCheck,
      title: 'Integrity',
      description: 'We conduct our business with the highest ethical standards and transparency in all our dealings.'
    },
    {
      icon: HiHeart,
      title: 'Customer First',
      description: 'Our clients\' needs and satisfaction are at the heart of everything we do.'
    },
    {
      icon: HiLightBulb,
      title: 'Innovation',
      description: 'We embrace new technologies and innovative approaches to enhance our services.'
    },
    {
      icon: HiAcademicCap,
      title: 'Excellence',
      description: 'We strive for excellence in every project and interaction with our clients.'
    },
    {
      icon: HiGlobeAlt,
      title: 'Community',
      description: 'We are committed to building stronger communities through quality development.'
    },
    {
      icon: HiTrendingUp,
      title: 'Growth',
      description: 'We focus on sustainable growth that benefits our clients and stakeholders.'
    }
  ];

  const team = [
    {
      name: 'Sarah Johnson',
      position: 'CEO & Founder',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: '15+ years in real estate development and investment',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Michael Chen',
      position: 'Chief Operations Officer',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Expert in project management and operations',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'Emily Rodriguez',
      position: 'Head of Sales',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Specialist in luxury residential properties',
      social: { linkedin: '#', twitter: '#' }
    },
    {
      name: 'David Kim',
      position: 'Lead Architect',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80',
      description: 'Award-winning architect with sustainable design focus',
      social: { linkedin: '#', twitter: '#' }
    }
  ];

  const achievements = [
    { icon: FaAward, title: 'Industry Awards', count: '25+', description: 'Recognition for excellence' },
    { icon: FaUsers, title: 'Happy Clients', count: '5000+', description: 'Satisfied customers' },
    { icon: FaHandshake, title: 'Successful Projects', count: '500+', description: 'Completed developments' },
    { icon: FaStar, title: 'Years Experience', count: '15+', description: 'In real estate industry' }
  ];

  const milestones = [
    { year: '2008', title: 'Company Founded', description: 'Started with a vision to transform real estate' },
    { year: '2012', title: 'First Major Project', description: 'Completed our first large-scale residential complex' },
    { year: '2016', title: 'Market Expansion', description: 'Extended operations to multiple cities' },
    { year: '2020', title: 'Digital Transformation', description: 'Launched innovative digital platform' },
    { year: '2023', title: 'Sustainability Focus', description: 'Committed to 100% sustainable developments' }
  ];

  return (
    <div className="min-h-screen pt-20">
      {/* Hero Section */}
      <section ref={heroRef} className="py-20 bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={heroInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center text-white"
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              About RealEstate
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-blue-100">
              Transforming dreams into reality through exceptional real estate experiences 
              and innovative property solutions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold">15+</div>
                <div className="text-blue-200">Years Experience</div>
              </div>
              <div className="hidden sm:block w-px bg-blue-300 mx-8"></div>
              <div className="text-center">
                <div className="text-4xl font-bold">5000+</div>
                <div className="text-blue-200">Happy Clients</div>
              </div>
              <div className="hidden sm:block w-px bg-blue-300 mx-8"></div>
              <div className="text-center">
                <div className="text-4xl font-bold">500+</div>
                <div className="text-blue-200">Projects Completed</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Our Story Section */}
      <section ref={storyRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                Our Story
              </h2>
              <div className="space-y-6 text-lg text-gray-600 dark:text-gray-300">
                <p>
                  Founded in 2008, RealEstate began with a simple yet powerful vision: to revolutionize 
                  the real estate industry by putting clients first and delivering exceptional value 
                  through every interaction.
                </p>
                <p>
                  What started as a small team of passionate real estate professionals has grown into 
                  a leading property development and management company, serving thousands of clients 
                  across multiple markets.
                </p>
                <p>
                  Today, we're proud to be recognized as industry leaders, known for our innovative 
                  approach, sustainable practices, and unwavering commitment to excellence. Our success 
                  is measured not just in properties sold, but in the dreams we've helped fulfill.
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={storyInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <img
                  src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Modern building"
                  className="rounded-lg shadow-lg"
                />
                <img
                  src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Luxury interior"
                  className="rounded-lg shadow-lg mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Team meeting"
                  className="rounded-lg shadow-lg -mt-8"
                />
                <img
                  src="https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
                  alt="Architecture"
                  className="rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 text-white rounded-full mb-6">
                <HiLightBulb className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Mission</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                To provide exceptional real estate services that exceed expectations, 
                create lasting value for our clients, and contribute to building stronger, 
                more vibrant communities through thoughtful development and sustainable practices.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-600 text-white rounded-full mb-6">
                <HiTrendingUp className="w-10 h-10" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Our Vision</h3>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                To be the most trusted and innovative real estate company, known for transforming 
                the industry through technology, sustainability, and an unwavering commitment to 
                client satisfaction and community development.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section ref={valuesRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={valuesInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Core Values
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              These fundamental principles guide every decision we make and every relationship we build.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 50 }}
                  animate={valuesInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center group hover:bg-gray-50 dark:hover:bg-gray-700 p-6 rounded-xl transition-all duration-300"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 text-white rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                    {value.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {value.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Our Journey
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Key milestones that have shaped our company and defined our success.
            </p>
          </motion.div>

          <div className="relative">
            <div className="absolute left-1/2 transform -translate-x-px h-full w-0.5 bg-blue-600"></div>
            
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className={`relative flex items-center ${
                  index % 2 === 0 ? 'justify-start' : 'justify-end'
                } mb-8`}
              >
                <div className={`w-5/12 ${index % 2 === 0 ? 'pr-12' : 'pl-12'}`}>
                  <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                    <div className="text-2xl font-bold text-blue-600 mb-2">
                      {milestone.year}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      {milestone.description}
                    </p>
                  </div>
                </div>
                
                <div className="absolute left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section ref={teamRef} className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={teamInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Meet Our Team
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The passionate professionals behind our success, dedicated to delivering 
              exceptional results for every client.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {team.map((member, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={teamInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="relative mb-6 mx-auto w-48 h-48 overflow-hidden rounded-full">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {member.name}
                </h3>
                <p className="text-blue-600 font-semibold mb-3">
                  {member.position}
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-4">
                  {member.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section ref={achievementsRef} className="py-20 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={achievementsInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Our Achievements
            </h2>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Numbers that speak to our commitment to excellence and client satisfaction.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {achievements.map((achievement, index) => {
              const Icon = achievement.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={achievementsInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className="text-center text-white"
                >
                  <Icon className="w-12 h-12 mx-auto mb-4" />
                  <div className="text-4xl font-bold mb-2">{achievement.count}</div>
                  <div className="text-lg font-semibold mb-1">{achievement.title}</div>
                  <div className="text-blue-200 text-sm">{achievement.description}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Work With Us?
            </h2>
            <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
              Join our family of satisfied clients and let us help you achieve your real estate goals. 
              Contact us today to get started on your property journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/contact"
                className="px-8 py-4 bg-white text-purple-600 hover:bg-gray-100 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                Get In Touch
              </a>
              <a
                href="/projects"
                className="px-8 py-4 border-2 border-white text-white hover:bg-white hover:text-purple-600 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105"
              >
                View Projects
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default About;