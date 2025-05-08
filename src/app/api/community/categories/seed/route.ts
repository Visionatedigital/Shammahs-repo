import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // First, ensure we have an admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@studiosix.com' },
      update: {},
      create: {
        email: 'admin@studiosix.com',
        name: 'StudioSix Admin',
        role: 'admin',
      },
    });

    // Create categories with their forums
    const categories = [
      {
        name: 'Announcements',
        description: 'Official updates from StudioSix team',
        icon: 'announcements',
        type: 'announcement',
        isAdminOnly: true,
        threads: [
          {
            name: 'General Announcements',
            description: 'Important updates and news',
          },
          {
            name: 'Release Notes',
            description: 'Latest features and improvements',
          },
        ],
      },
      {
        name: 'Show Your Work',
        description: 'Share your renders and get feedback',
        icon: 'gallery',
        type: 'showcase',
        isAdminOnly: false,
        threads: [
          {
            name: 'Exterior',
            description: 'Share and discuss exterior architectural renders',
          },
          {
            name: 'Interior',
            description: 'Share and discuss interior design renders',
          },
          {
            name: 'Landscape',
            description: 'Share and discuss landscape design renders',
          },
          {
            name: 'Floorplan',
            description: 'Share and discuss architectural floorplans',
          },
          {
            name: 'Concept',
            description: 'Share and discuss conceptual designs and ideas',
          },
        ],
      },
      {
        name: 'Tips & Workflows',
        description: 'Share prompts and techniques',
        icon: 'tips',
        type: 'tips',
        isAdminOnly: false,
        threads: [
          {
            name: 'Beginner Tips',
            description: 'Getting started with StudioSix',
          },
          {
            name: 'Advanced Techniques',
            description: 'Pro tips and advanced workflows',
          },
          {
            name: 'Prompts Library',
            description: 'Share and discover effective prompts',
          },
        ],
      },
      {
        name: 'Ask the Community',
        description: 'Get help from fellow creators',
        icon: 'ask-the-community',
        type: 'questions',
        isAdminOnly: false,
        threads: [
          {
            name: 'General Help',
            description: 'General questions about using StudioSix',
          },
          {
            name: 'Technical Support',
            description: 'Technical issues and troubleshooting',
          },
          {
            name: 'Integration Help',
            description: 'Questions about integrating with other tools',
          },
          {
            name: 'Best Practices',
            description: 'Questions about workflow optimization',
          },
        ],
      },
      {
        name: 'Bug Reports',
        description: 'Report technical issues',
        icon: 'bug-droid',
        type: 'bugs',
        isAdminOnly: false,
        threads: [
          {
            name: 'UI Issues',
            description: 'Interface and visual bugs',
          },
          {
            name: 'Performance Issues',
            description: 'Slowdowns, crashes, and optimization problems',
          },
          {
            name: 'Rendering Issues',
            description: 'Problems with image generation and rendering',
          },
          {
            name: 'Export/Import Issues',
            description: 'Problems with file handling and data transfer',
          },
        ],
      },
      {
        name: 'Feature Requests',
        description: 'Suggest new features',
        icon: 'features',
        type: 'features',
        isAdminOnly: false,
        threads: [
          {
            name: 'UI Improvements',
            description: 'Suggestions for interface enhancements',
          },
          {
            name: 'Workflow Features',
            description: 'Ideas for improving the design process',
          },
          {
            name: 'Integration Requests',
            description: 'Suggestions for new tool integrations',
          },
          {
            name: 'AI Capabilities',
            description: 'Ideas for new AI-powered features',
          },
        ],
      },
    ];

    // Create categories and their threads
    for (const category of categories) {
      const { threads, ...categoryData } = category;
      const createdCategory = await prisma.communityCategory.create({
        data: {
          ...categoryData,
          threads: {
            create: threads.map(thread => ({
              name: thread.name,
              author: {
                connect: { id: adminUser.id }
              },
              messages: {
                create: {
                  content: thread.description,
                  author: {
                    connect: { id: adminUser.id }
                  }
                }
              }
            })),
          },
        },
      });
    }

    return NextResponse.json({ message: 'Categories seeded successfully' });
  } catch (error) {
    console.error('Error seeding categories:', error);
    return NextResponse.json(
      { error: 'Failed to seed categories' },
      { status: 500 }
    );
  }
} 