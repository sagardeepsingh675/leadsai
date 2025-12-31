import { useEffect, useState } from 'react';
import {
    HelpCircle,
    Plus,
    MessageSquare,
    Clock,
    X,
    Upload,
    Send,
    Loader2,
    CheckCircle,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

interface Ticket {
    id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    attachment_url: string | null;
    admin_response: string | null;
    created_at: string;
    updated_at: string;
}

interface TicketMessage {
    id: string;
    message: string;
    is_admin: boolean;
    attachment_url: string | null;
    created_at: string;
}

const statusColors = {
    open: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    in_progress: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/30',
    closed: 'bg-dark-600 text-dark-400 border-dark-500',
};

const priorityColors = {
    low: 'text-dark-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
};

export default function SupportTickets() {
    const { profile } = useAuth();
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [showNewTicket, setShowNewTicket] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);

    const [newTicket, setNewTicket] = useState({
        subject: '',
        description: '',
        priority: 'medium' as const,
        category: 'general',
    });
    const [uploading, setUploading] = useState(false);
    const [attachmentFile, setAttachmentFile] = useState<File | null>(null);
    const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);

    useEffect(() => {
        if (profile) loadTickets();
    }, [profile]);

    async function loadTickets() {
        const { data } = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', profile?.id)
            .order('created_at', { ascending: false });

        if (data) setTickets(data);
        setLoading(false);
    }

    async function loadMessages(ticketId: string) {
        const { data } = await supabase
            .from('ticket_messages')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true });

        if (data) setMessages(data);
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAttachmentFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachmentPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const uploadFile = async (file: File): Promise<string | null> => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${profile?.id}/${Date.now()}.${fileExt}`;

        const { error } = await supabase.storage
            .from('ticket-attachments')
            .upload(fileName, file);

        if (error) {
            console.error('Upload error:', error);
            return null;
        }

        const { data } = supabase.storage
            .from('ticket-attachments')
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const handleCreateTicket = async () => {
        if (!profile || !newTicket.subject || !newTicket.description) return;

        setUploading(true);
        let attachmentUrl = null;

        if (attachmentFile) {
            attachmentUrl = await uploadFile(attachmentFile);
        }

        const { error } = await supabase.from('support_tickets').insert({
            user_id: profile.id,
            subject: newTicket.subject,
            description: newTicket.description,
            priority: newTicket.priority,
            category: newTicket.category,
            attachment_url: attachmentUrl,
        });

        if (!error) {
            await loadTickets();
            setShowNewTicket(false);
            setNewTicket({ subject: '', description: '', priority: 'medium', category: 'general' });
            setAttachmentFile(null);
            setAttachmentPreview(null);
        }
        setUploading(false);
    };

    const openTicketDetails = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        await loadMessages(ticket.id);
    };

    const handleSendMessage = async () => {
        if (!selectedTicket || !newMessage.trim()) return;
        setSending(true);

        await supabase.from('ticket_messages').insert({
            ticket_id: selectedTicket.id,
            user_id: profile?.id,
            message: newMessage,
            is_admin: false,
        });

        setNewMessage('');
        await loadMessages(selectedTicket.id);
        setSending(false);
    };

    const handleCloseTicket = async () => {
        if (!selectedTicket) return;

        const { error } = await supabase
            .from('support_tickets')
            .update({ status: 'closed', updated_at: new Date().toISOString() })
            .eq('id', selectedTicket.id);

        if (!error) {
            setSelectedTicket({ ...selectedTicket, status: 'closed' });
            await loadTickets();
        }
    };

    const formatDate = (date: string) => {
        return new Date(date).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
                    <p className="text-dark-400">Get help from our support team</p>
                </div>
                <button onClick={() => setShowNewTicket(true)} className="btn-primary">
                    <Plus className="w-4 h-4" />
                    New Ticket
                </button>
            </div>

            {/* Tickets List */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-primary-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading tickets...</p>
                    </div>
                ) : tickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <HelpCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No tickets yet</h3>
                        <p className="text-dark-400 mb-6">Create a ticket to get help from our team</p>
                        <button onClick={() => setShowNewTicket(true)} className="btn-primary">
                            <Plus className="w-4 h-4" />
                            Create Ticket
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-dark-700">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                onClick={() => openTicketDetails(ticket)}
                                className="p-4 hover:bg-dark-800/50 cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${ticket.status === 'open' ? 'bg-blue-500/20' :
                                        ticket.status === 'resolved' ? 'bg-green-500/20' : 'bg-dark-700'
                                        }`}>
                                        <MessageSquare className={`w-5 h-5 ${ticket.status === 'open' ? 'text-blue-400' :
                                            ticket.status === 'resolved' ? 'text-green-400' : 'text-dark-400'
                                            }`} />
                                    </div>
                                    <div>
                                        <h4 className="text-white font-medium">{ticket.subject}</h4>
                                        <p className="text-dark-400 text-sm line-clamp-1">{ticket.description}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`badge border ${statusColors[ticket.status]}`}>
                                        {ticket.status.replace('_', ' ')}
                                    </span>
                                    <span className="text-dark-500 text-sm flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {formatDate(ticket.created_at)}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* New Ticket Modal */}
            {showNewTicket && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowNewTicket(false)}>
                    <div className="glass-card p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">New Support Ticket</h2>
                            <button onClick={() => setShowNewTicket(false)} className="p-1 hover:bg-dark-700 rounded">
                                <X className="w-5 h-5 text-dark-400" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="label">Subject</label>
                                <input
                                    type="text"
                                    value={newTicket.subject}
                                    onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                                    className="input"
                                    placeholder="Brief description of your issue"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="label">Category</label>
                                    <select
                                        value={newTicket.category}
                                        onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                                        className="select"
                                    >
                                        <option value="general">General</option>
                                        <option value="billing">Billing</option>
                                        <option value="technical">Technical</option>
                                        <option value="feature">Feature Request</option>
                                        <option value="bug">Bug Report</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="label">Priority</label>
                                    <select
                                        value={newTicket.priority}
                                        onChange={(e) => setNewTicket({ ...newTicket, priority: e.target.value as any })}
                                        className="select"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="label">Description</label>
                                <textarea
                                    value={newTicket.description}
                                    onChange={(e) => setNewTicket({ ...newTicket, description: e.target.value })}
                                    className="input min-h-[120px]"
                                    placeholder="Describe your issue in detail..."
                                />
                            </div>

                            {/* Attachment */}
                            <div>
                                <label className="label">Attachment (Optional)</label>
                                {attachmentPreview ? (
                                    <div className="relative">
                                        <img src={attachmentPreview} alt="Preview" className="w-full max-h-48 object-cover rounded-lg" />
                                        <button
                                            onClick={() => { setAttachmentFile(null); setAttachmentPreview(null); }}
                                            className="absolute top-2 right-2 p-1 bg-red-500 rounded-full"
                                        >
                                            <X className="w-4 h-4 text-white" />
                                        </button>
                                    </div>
                                ) : (
                                    <label className="flex flex-col items-center justify-center border-2 border-dashed border-dark-600 rounded-xl p-6 cursor-pointer hover:border-primary-500 transition-colors">
                                        <Upload className="w-8 h-8 text-dark-500 mb-2" />
                                        <span className="text-dark-400 text-sm">Click to upload image</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleFileChange}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                            </div>

                            <button
                                onClick={handleCreateTicket}
                                disabled={uploading || !newTicket.subject || !newTicket.description}
                                className="btn-primary w-full"
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                Create Ticket
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
                    <div className="glass-card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b border-dark-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-3 mt-2">
                                        <span className={`badge border ${statusColors[selectedTicket.status]}`}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </span>
                                        <span className={`text-sm ${priorityColors[selectedTicket.priority]}`}>
                                            {selectedTicket.priority} priority
                                        </span>
                                        <span className="text-dark-500 text-sm">
                                            {formatDate(selectedTicket.created_at)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {selectedTicket.status !== 'closed' && (
                                        <button
                                            onClick={handleCloseTicket}
                                            className="btn-secondary text-sm"
                                        >
                                            <CheckCircle className="w-4 h-4" />
                                            Close Ticket
                                        </button>
                                    )}
                                    <button onClick={() => setSelectedTicket(null)} className="p-1 hover:bg-dark-700 rounded">
                                        <X className="w-5 h-5 text-dark-400" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {/* Original Description */}
                            <div className="bg-dark-800/50 rounded-xl p-4">
                                <p className="text-dark-300">{selectedTicket.description}</p>
                                {selectedTicket.attachment_url && (
                                    <div className="mt-3">
                                        <a href={selectedTicket.attachment_url} target="_blank" rel="noopener noreferrer">
                                            <img
                                                src={selectedTicket.attachment_url}
                                                alt="Attachment"
                                                className="max-h-48 rounded-lg cursor-pointer hover:opacity-80"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-xl ${msg.is_admin ? 'bg-primary-500/10 border border-primary-500/30' : 'bg-dark-800/50'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-sm font-medium ${msg.is_admin ? 'text-primary-400' : 'text-white'}`}>
                                            {msg.is_admin ? 'Support Team' : 'You'}
                                        </span>
                                        <span className="text-dark-500 text-xs">{formatDate(msg.created_at)}</span>
                                    </div>
                                    <p className="text-dark-300">{msg.message}</p>
                                    {msg.attachment_url && (
                                        <a href={msg.attachment_url} target="_blank" rel="noopener noreferrer">
                                            <img src={msg.attachment_url} alt="Attachment" className="mt-2 max-h-32 rounded-lg" />
                                        </a>
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        {selectedTicket.status !== 'closed' && (
                            <div className="p-4 border-t border-dark-700">
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                        placeholder="Type your reply..."
                                        className="input flex-1"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        disabled={sending || !newMessage.trim()}
                                        className="btn-primary"
                                    >
                                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
