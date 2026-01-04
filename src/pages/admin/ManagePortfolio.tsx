import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import {
    FolderKanban,
    Plus,
    Edit,
    Trash2,
    X,
    Save,
    Loader2,
    Star,
    Eye,
    EyeOff,
    ExternalLink,
    RefreshCw,
} from 'lucide-react';

interface PortfolioProject {
    id: string;
    title: string;
    description?: string;
    service_type?: string;
    client_name?: string;
    image_url?: string;
    project_url?: string;
    technologies: string[];
    is_featured: boolean;
    is_active: boolean;
    display_order: number;
    created_at: string;
}

const serviceTypes = [
    { value: 'web_dev', label: 'Website Development' },
    { value: 'saas', label: 'SaaS Application' },
    { value: 'android', label: 'Android App' },
    { value: 'custom', label: 'Custom Solution' },
];

const emptyProject: Partial<PortfolioProject> = {
    title: '',
    description: '',
    service_type: 'web_dev',
    client_name: '',
    image_url: '',
    project_url: '',
    technologies: [],
    is_featured: false,
    is_active: true,
    display_order: 0,
};

export default function ManagePortfolio() {
    const [projects, setProjects] = useState<PortfolioProject[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingProject, setEditingProject] = useState<Partial<PortfolioProject> | null>(null);
    const [isNewProject, setIsNewProject] = useState(false);
    const [saving, setSaving] = useState(false);
    const [techInput, setTechInput] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('portfolio_projects')
                .select('*')
                .order('display_order', { ascending: true });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleNewProject = () => {
        setEditingProject({ ...emptyProject, display_order: projects.length });
        setIsNewProject(true);
        setTechInput('');
    };

    const handleEditProject = (project: PortfolioProject) => {
        setEditingProject(project);
        setIsNewProject(false);
        setTechInput('');
    };

    const handleAddTech = () => {
        if (techInput.trim() && editingProject) {
            const currentTechs = editingProject.technologies || [];
            if (!currentTechs.includes(techInput.trim())) {
                setEditingProject({
                    ...editingProject,
                    technologies: [...currentTechs, techInput.trim()],
                });
            }
            setTechInput('');
        }
    };

    const handleRemoveTech = (tech: string) => {
        if (editingProject) {
            setEditingProject({
                ...editingProject,
                technologies: (editingProject.technologies || []).filter(t => t !== tech),
            });
        }
    };

    const handleSaveProject = async () => {
        if (!editingProject || !editingProject.title) return;

        setSaving(true);
        try {
            if (isNewProject) {
                const { data, error } = await supabase
                    .from('portfolio_projects')
                    .insert({
                        title: editingProject.title,
                        description: editingProject.description,
                        service_type: editingProject.service_type,
                        client_name: editingProject.client_name,
                        image_url: editingProject.image_url,
                        project_url: editingProject.project_url,
                        technologies: editingProject.technologies,
                        is_featured: editingProject.is_featured,
                        is_active: editingProject.is_active,
                        display_order: editingProject.display_order,
                    })
                    .select()
                    .single();

                if (error) throw error;
                setProjects(prev => [...prev, data]);
            } else {
                const { error } = await supabase
                    .from('portfolio_projects')
                    .update({
                        title: editingProject.title,
                        description: editingProject.description,
                        service_type: editingProject.service_type,
                        client_name: editingProject.client_name,
                        image_url: editingProject.image_url,
                        project_url: editingProject.project_url,
                        technologies: editingProject.technologies,
                        is_featured: editingProject.is_featured,
                        is_active: editingProject.is_active,
                        display_order: editingProject.display_order,
                    })
                    .eq('id', editingProject.id);

                if (error) throw error;
                setProjects(prev => prev.map(p => p.id === editingProject.id ? { ...p, ...editingProject } as PortfolioProject : p));
            }

            setEditingProject(null);
        } catch (error) {
            console.error('Error saving project:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm('Are you sure you want to delete this project?')) return;

        try {
            const { error } = await supabase
                .from('portfolio_projects')
                .delete()
                .eq('id', id);

            if (error) throw error;
            setProjects(prev => prev.filter(p => p.id !== id));
        } catch (error) {
            console.error('Error deleting project:', error);
        }
    };

    const toggleFeatured = async (project: PortfolioProject) => {
        try {
            const { error } = await supabase
                .from('portfolio_projects')
                .update({ is_featured: !project.is_featured })
                .eq('id', project.id);

            if (error) throw error;
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_featured: !p.is_featured } : p));
        } catch (error) {
            console.error('Error toggling featured:', error);
        }
    };

    const toggleActive = async (project: PortfolioProject) => {
        try {
            const { error } = await supabase
                .from('portfolio_projects')
                .update({ is_active: !project.is_active })
                .eq('id', project.id);

            if (error) throw error;
            setProjects(prev => prev.map(p => p.id === project.id ? { ...p, is_active: !p.is_active } : p));
        } catch (error) {
            console.error('Error toggling active:', error);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FolderKanban className="w-7 h-7 text-emerald-400" />
                        Portfolio Management
                    </h1>
                    <p className="text-gray-400 mt-1">Manage portfolio projects for stachbit.in</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={fetchProjects}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-white transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Refresh
                    </button>
                    <button
                        onClick={handleNewProject}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add Project
                    </button>
                </div>
            </div>

            {/* Projects List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-20 bg-gray-800/50 rounded-xl">
                    <FolderKanban className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 mb-4">No portfolio projects yet</p>
                    <button
                        onClick={handleNewProject}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Add First Project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className={`bg-gray-800/50 rounded-xl overflow-hidden ${!project.is_active ? 'opacity-60' : ''}`}
                        >
                            {/* Image */}
                            {project.image_url && (
                                <img
                                    src={project.image_url}
                                    alt={project.title}
                                    className="w-full h-40 object-cover"
                                />
                            )}

                            {/* Content */}
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2 mb-2">
                                    <h3 className="text-white font-medium">{project.title}</h3>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => toggleFeatured(project)}
                                            className={`p-1.5 rounded transition-colors ${project.is_featured ? 'text-yellow-400' : 'text-gray-500 hover:text-yellow-400'}`}
                                            title={project.is_featured ? 'Remove from featured' : 'Mark as featured'}
                                        >
                                            <Star className="w-4 h-4" fill={project.is_featured ? 'currentColor' : 'none'} />
                                        </button>
                                        <button
                                            onClick={() => toggleActive(project)}
                                            className={`p-1.5 rounded transition-colors ${project.is_active ? 'text-green-400' : 'text-gray-500 hover:text-green-400'}`}
                                            title={project.is_active ? 'Hide project' : 'Show project'}
                                        >
                                            {project.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {project.client_name && (
                                    <p className="text-emerald-400 text-sm mb-2">{project.client_name}</p>
                                )}

                                <p className="text-gray-400 text-sm line-clamp-2 mb-3">{project.description}</p>

                                {/* Technologies */}
                                {project.technologies?.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {project.technologies.slice(0, 3).map(tech => (
                                            <span key={tech} className="px-2 py-0.5 text-xs bg-gray-700 text-gray-300 rounded">
                                                {tech}
                                            </span>
                                        ))}
                                        {project.technologies.length > 3 && (
                                            <span className="px-2 py-0.5 text-xs bg-gray-700 text-gray-400 rounded">
                                                +{project.technologies.length - 3}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-700">
                                    {project.project_url && (
                                        <a
                                            href={project.project_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-2 text-gray-400 hover:text-white transition-colors"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    )}
                                    <button
                                        onClick={() => handleEditProject(project)}
                                        className="p-2 text-emerald-400 hover:bg-emerald-500/10 rounded transition-colors"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDeleteProject(project.id)}
                                        className="p-2 text-red-400 hover:bg-red-500/10 rounded transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Edit/Add Modal */}
            {editingProject && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                    <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white">
                                {isNewProject ? 'Add New Project' : 'Edit Project'}
                            </h2>
                            <button
                                onClick={() => setEditingProject(null)}
                                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Title *</label>
                                <input
                                    type="text"
                                    value={editingProject.title || ''}
                                    onChange={(e) => setEditingProject({ ...editingProject, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                    placeholder="Project title"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Client Name</label>
                                    <input
                                        type="text"
                                        value={editingProject.client_name || ''}
                                        onChange={(e) => setEditingProject({ ...editingProject, client_name: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Client name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Service Type</label>
                                    <select
                                        value={editingProject.service_type || 'web_dev'}
                                        onChange={(e) => setEditingProject({ ...editingProject, service_type: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                    >
                                        {serviceTypes.map(type => (
                                            <option key={type.value} value={type.value}>{type.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Description</label>
                                <textarea
                                    value={editingProject.description || ''}
                                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                                    rows={3}
                                    className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500 resize-none"
                                    placeholder="Short project description"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Image URL</label>
                                    <input
                                        type="url"
                                        value={editingProject.image_url || ''}
                                        onChange={(e) => setEditingProject({ ...editingProject, image_url: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="https://..."
                                    />
                                </div>
                                <div>
                                    <label className="block text-gray-400 text-sm mb-2">Project URL</label>
                                    <input
                                        type="url"
                                        value={editingProject.project_url || ''}
                                        onChange={(e) => setEditingProject({ ...editingProject, project_url: e.target.value })}
                                        className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="https://..."
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-400 text-sm mb-2">Technologies</label>
                                <div className="flex gap-2 mb-2">
                                    <input
                                        type="text"
                                        value={techInput}
                                        onChange={(e) => setTechInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-emerald-500"
                                        placeholder="Add technology..."
                                    />
                                    <button
                                        onClick={handleAddTech}
                                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
                                    >
                                        Add
                                    </button>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {(editingProject.technologies || []).map(tech => (
                                        <span
                                            key={tech}
                                            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-sm"
                                        >
                                            {tech}
                                            <button
                                                onClick={() => handleRemoveTech(tech)}
                                                className="hover:text-red-400 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingProject.is_featured || false}
                                        onChange={(e) => setEditingProject({ ...editingProject, is_featured: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-white">Featured Project</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={editingProject.is_active !== false}
                                        onChange={(e) => setEditingProject({ ...editingProject, is_active: e.target.checked })}
                                        className="w-4 h-4 rounded border-gray-700 text-emerald-500 focus:ring-emerald-500"
                                    />
                                    <span className="text-white">Active (Visible)</span>
                                </label>
                            </div>

                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-800">
                                <button
                                    onClick={() => setEditingProject(null)}
                                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSaveProject}
                                    disabled={saving || !editingProject.title}
                                    className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Saving...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-4 h-4" />
                                            {isNewProject ? 'Add Project' : 'Save Changes'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
