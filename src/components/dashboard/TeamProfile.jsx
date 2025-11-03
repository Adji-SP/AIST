import React, { useState } from 'react';
// Ikon yang dibutuhkan, termasuk Instagram
import { User, Users, Briefcase, Code, Server, Award, Mail, Linkedin, Instagram, CheckCircle, ChartLine } from 'lucide-react';
import Sidebar from '../layout/sidebar';
import Header from '../layout/header';
// Mengimpor gambar lokal untuk latar belakang header
import image_url from '../images/ITS.png';

// =================================================================================
// Professional UI Components Tailored for this Page
// =================================================================================

const SectionHeader = ({ title, icon: Icon }) => (
    <div className="flex items-center gap-3 mb-6">
        <Icon className="w-7 h-7 text-green-600" />
        <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
    </div>
);

// [REDESIGNED] Komponen Kartu Anggota Tim Sesuai Gambar
const TeamMemberCard = ({ member }) => {
    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
            {/* Bagian Info Utama */}
            <div className="text-center flex-grow">
                {/* Avatar dengan Gambar */}
                <div className="w-24 h-24 p-1 rounded-full mx-auto mb-4 bg-blue-100 flex items-center justify-center">
                    <img
                        src={member.imageUrl}
                        alt={`Profile of ${member.name}`}
                        className="w-full h-full rounded-full object-cover"
                    />
                </div>
                <h3 className="text-xl font-bold text-slate-800">{member.name}</h3>
                <p className="font-medium text-slate-500">{member.role}</p>
                {member.studentId && <p className="text-sm mt-1 text-slate-400">{member.studentId}</p>}
            </div>

            {/* Bagian Bawah dengan Tanggung Jawab dan Tautan */}
            <div className="mt-4 pt-4 border-t border-slate-200">
                 <h4 className="font-semibold text-green-700 mb-3">Responsibilities:</h4>
                 <ul className="space-y-2 text-sm text-slate-600 text-left">
                    {member.responsibilities.slice(0, 3).map((resp, i) => (
                        <li key={i} className="flex items-start gap-2">
                            <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                            <span>{resp}</span>
                        </li>
                    ))}
                 </ul>
                 {/* Tautan Sosial Media */}
                 <div className="flex justify-center gap-4 mt-6 pt-4 border-t border-slate-100">
                     <a href={`mailto:${member.email}`} aria-label="Email" className="p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-green-600 transition-colors"><Mail className="w-5 h-5"/></a>
                     <a href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-green-600 transition-colors"><Linkedin className="w-5 h-5"/></a>
                     <a href={member.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="p-2 text-slate-400 rounded-full hover:bg-slate-100 hover:text-green-600 transition-colors"><Instagram className="w-5 h-5"/></a>
                 </div>
            </div>
        </div>
    );
};

// Kartu Supervisor yang tetap mempertahankan gaya premium
const SupervisorCard = ({ member }) => (
    <div className="relative bg-slate-800 text-white rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border border-slate-700">
        <div className="absolute top-4 right-4 bg-yellow-400 text-slate-900 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider">
            Supervisor
        </div>
        <div className="text-center flex-grow">
            <div className="w-24 h-24 p-1 rounded-full mx-auto mb-4 bg-slate-700">
                <img src={member.imageUrl} alt={`Profile of ${member.name}`} className="w-full h-full rounded-full object-cover" />
            </div>
            <h3 className="text-xl font-bold text-white">{member.name}</h3>
            <p className="font-medium text-slate-300">{member.role}</p>
        </div>
        <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}>
            <h4 className="font-semibold text-green-400 mb-3">Responsibilities:</h4>
            <ul className="space-y-2 text-sm text-slate-300 text-left">
                {member.responsibilities.map((resp, i) => (
                    <li key={i} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-400" />
                        <span>{resp}</span>
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const ProjectOverview = () => (
    <div className="mb-12 p-8 bg-slate-700 text-white rounded-xl text-center relative overflow-hidden">
        <img src={image_url} alt="ITS Campus Background" className="absolute inset-0 w-full h-full object-cover opacity-30" style={{ zIndex: 0 }} />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-800 via-slate-800/70 to-transparent"></div>
        <div className="relative z-10">
            <Users className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <h1 className="text-4xl font-extrabold mb-20" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.5)' }}>Verenigen Team</h1>
            <p className="max-w-3xl mx-auto text-slate-300" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.5)' }}>
                Meet the dedicated team of supervisors and students behind the Advanced Agricultural Monitoring System for precision farming and sustainable citrus cultivation.
            </p>
        </div>
    </div>
);

// ... Komponen lainnya (Technologies, Workflow, Achievements) tetap sama

const TechnologiesSection = ({ tools }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Technologies & Tools Used" icon={Code} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tools.map((tool) => (
                <div key={tool.name} className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 border border-slate-200">
                    <div className="p-2 rounded-full" style={{ backgroundColor: `${tool.color}20` }}>{tool.icon}</div>
                    <div>
                        <h4 className="font-semibold text-slate-800">{tool.name}</h4>
                        <p className="text-sm text-slate-500">{tool.category}</p>
                    </div>
                </div>
            ))}
        </div>
    </div>
);

const WorkflowSection = ({ workflow }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Development Workflow" icon={Briefcase} />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {workflow.map((phase) => (
                <div key={phase.phase} className="text-center p-4">
                     <div className="mx-auto mb-3 flex items-center justify-center w-16 h-16 rounded-full" style={{ background: `${phase.color}20` }}>
                         {phase.icon}
                     </div>
                     <h3 className="font-bold text-lg text-slate-800 mb-2">{phase.phase}</h3>
                     <p className="text-sm text-slate-500">{phase.description}</p>
                </div>
            ))}
        </div>
    </div>
);

const AchievementsSection = ({ achievements }) => (
     <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <SectionHeader title="Team Contributions & Achievements" icon={Award} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {achievements.map((item) => (
                 <div key={item.title} className="p-6 rounded-lg bg-slate-50 border border-slate-200 text-center">
                    {item.icon}
                    <h3 className="font-bold text-lg text-slate-800 mt-2 mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-500">{item.description}</p>
                 </div>
            ))}
        </div>
    </div>
);


const TeamProfilePage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);

    // [UPDATED] Data dengan imageUrl dan tautan sosial
    const supervisor = {
        name: 'Ir. Safira Firdaus',
        role: 'Project Supervisor',
        imageUrl: `https://avatar.iran.liara.run/public/job/teacher/male`,
        responsibilities: ['Oversee project direction', 'Provide technical guidance', 'Ensure academic alignment']
    };
    
    const students = [
        { name: 'Muhammad Riandy Pratama', role: 'Team Leader', studentId: 'NIM: 2021001', imageUrl: 'https://avatar.iran.liara.run/public/girl', responsibilities: ['Lead frontend development', 'Implement UI/UX design', 'Coordinate team tasks'], email:'ndyy@example.com', linkedin:'https://linkedin.com/in/ndyy', instagram:'https://instagram.com/ndyy' },
        { name: 'Satrio Adji Purwo', role: 'Backend & Data Acquisition', studentId: 'NIM: 2021002', imageUrl: 'https://avatar.iran.liara.run/public/boy', responsibilities: ['Develop and maintain APIs', 'Optimize database', 'Implement data processing'], email:'jii@example.com', linkedin:'https://linkedin.com/in/jii', instagram:'https://instagram.com/jii' },
        { name: 'Akhmad Maulvin Nazir Zakaria', role: 'Frontend & Hardware', studentId: 'NIM: 2021003', imageUrl: 'https://avatar.iran.liara.run/public/boy', responsibilities: ['Configure IoT devices', 'Implement serial communication', 'Frontend integration'], email:'jonathan@example.com', linkedin:'https://linkedin.com/in/jonathan', instagram:'https://instagram.com/jonathan' },
        { name: 'Yus Putri Arum Segar', role: 'Data Analyst', studentId: 'NIM: 2021004', imageUrl: 'https://avatar.iran.liara.run/public/girl', responsibilities: ['Analyze sensor data', 'Develop predictive models', 'Generate reports'], email:'yuuuss@example.com', linkedin:'https://linkedin.com/in/yuuuss', instagram:'https://instagram.com/yuuuss' },
    ];

    const tools = [ { name: 'React.js', icon: <Code className="w-6 h-6 text-sky-500" />, color: '#0ea5e9', category: 'Frontend' }, { name: 'Node.js', icon: <Server className="w-6 h-6 text-green-500" />, color: '#22c55e', category: 'Backend' }, { name: 'Python', icon: <Code className="w-6 h-6 text-blue-500" />, color: '#3b82f6', category: 'Data Analysis' }, { name: 'FireBase', icon: <Server className="w-6 h-6 text-lime-600" />, color: '#65a30d', category: 'Database' }, { name: 'IoT', icon: <Server className="w-6 h-6 text-orange-500" />, color: '#f97316', category: 'Cloud/IoT' }, { name: 'WebSocket', icon: <Server className="w-6 h-6 text-violet-500" />, color: '#8b5cf6', category: 'Real-time' }, { name: 'Git', icon: <Code className="w-6 h-6 text-red-500" />, color: '#ef4444', category: 'Version Control' }, { name: 'Tailwind CSS', icon: <Code className="w-6 h-6 text-cyan-500" />, color: '#06b6d4', category: 'Styling' }];

    const workflow = [ { phase: 'Planning', icon: <Briefcase className="w-8 h-8 text-blue-500"/>, color: '#3b82f6', description: 'Define scope, research, and select technology stack.' }, { phase: 'System Design', icon: <Code className="w-8 h-8 text-emerald-500"/>, color: '#10b981', description: 'Architect the system, design database schemas, and create UI wireframes.' }, { phase: 'Development', icon: <Server className="w-8 h-8 text-amber-500"/>, color: '#f59e0b', description: 'Build frontend, develop backend APIs, and integrate IoT sensors.' }, { phase: 'Testing', icon: <CheckCircle className="w-8 h-8 text-red-500"/>, color: '#ef4444', description: 'Conduct unit tests, integration testing, and performance optimization.' }, { phase: 'Deployment', icon: <ChartLine className="w-8 h-8 text-violet-500"/>, color: '#8b5cf6', description: 'Deploy to production, monitor performance, and perform maintenance.' }, ];
    
    const achievements = [ { title: 'Real-time Monitoring', description: 'Implemented WebSocket integration for live sensor data updates.', icon: <ChartLine className="w-8 h-8 text-green-500"/> }, { title: 'Scalable Architecture', description: 'Designed a robust backend with optimized database queries for future growth.', icon: <Server className="w-8 h-8 text-orange-500"/> }, { title: 'User-Centric Design', description: 'Developed an intuitive UI with interactive data visualizations for ease of use.', icon: <Award className="w-8 h-8 text-violet-500"/> } ];

    return (
        <div className="min-h-screen bg-slate-50 flex">
            <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setSidebarCollapsed(!isSidebarCollapsed)} />
            <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
                <Header onMenuClick={() => setSidebarOpen(true)} selectedGarden="Nipis Citrus" onGardenChange={() => { }} />
                <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
                    <ProjectOverview />
                    <div className="mb-12">
                        <SectionHeader title="Project Supervisor" icon={Award} />
                        <div className="max-w-xl mx-auto">
                           <SupervisorCard member={supervisor} />
                        </div>
                    </div>
                    <div className="mb-12">
                         <SectionHeader title="Student Team Members" icon={Users} />
                         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
                             {students.map((student) => (
                                <TeamMemberCard key={student.name} member={student} />
                             ))}
                         </div>
                    </div>
                    <div className="space-y-8">
                       <TechnologiesSection tools={tools} />
                       <WorkflowSection workflow={workflow} />
                       <AchievementsSection achievements={achievements} />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default TeamProfilePage;