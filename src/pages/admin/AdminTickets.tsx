import { useEffect, useState } from 'react';
import {
    HelpCircle,
    Clock,
    X,
    Send,
    Loader2,
    Eye,
    Filter,
    RefreshCw,
    User,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Ticket {
    id: string;
    user_id: string;
    subject: string;
    description: string;
    status: 'open' | 'in_progress' | 'resolved' | 'closed';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    category: string;
    attachment_url: string | null;
    created_at: string;
    updated_at: string;
    user_profiles?: {
        full_name: string | null;
        email: string;
    };
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

export default function AdminTickets() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [messages, setMessages] = useState<TicketMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('all');

    useEffect(() => {
        loadTickets();
    }, []);

    async function loadTickets() {
        setLoading(true);
        const { data } = await supabase
            .from('support_tickets')
            .select(`*, user_profiles(full_name, email)`)
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

    const openTicketDetails = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        await loadMessages(ticket.id);
    };

    const handleSendMessage = async () => {
        if (!selectedTicket || !newMessage.trim()) return;
        setSending(true);

        const { data: { user } } = await supabase.auth.getUser();

        await supabase.from('ticket_messages').insert({
            ticket_id: selectedTicket.id,
            user_id: user?.id,
            message: newMessage,
            is_admin: true,
        });

        // Update ticket status to in_progress if it was open
        if (selectedTicket.status === 'open') {
            await supabase
                .from('support_tickets')
                .update({ status: 'in_progress', updated_at: new Date().toISOString() })
                .eq('id', selectedTicket.id);
        }

        setNewMessage('');
        await loadMessages(selectedTicket.id);
        await loadTickets();
        setSending(false);
    };

    const handleStatusChange = async (ticketId: string, status: string) => {
        await supabase
            .from('support_tickets')
            .update({ status, updated_at: new Date().toISOString() })
            .eq('id', ticketId);

        await loadTickets();
        if (selectedTicket?.id === ticketId) {
            setSelectedTicket({ ...selectedTicket, status: status as any });
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

    const filteredTickets = tickets.filter(t =>
        statusFilter === 'all' || t.status === statusFilter
    );

    const stats = {
        open: tickets.filter(t => t.status === 'open').length,
        in_progress: tickets.filter(t => t.status === 'in_progress').length,
        resolved: tickets.filter(t => t.status === 'resolved').length,
        total: tickets.length,
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        <HelpCircle className="w-7 h-7 text-primary-400" />
                        Support Tickets
                    </h1>
                    <p className="text-dark-400">Manage customer support requests</p>
                </div>
                <button onClick={loadTickets} className="btn-secondary">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="card p-4 cursor-pointer hover:ring-2 hover:ring-primary-500" onClick={() => setStatusFilter('all')}>
                    <p className="text-dark-400 text-sm">Total</p>
                    <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
                <div className="card p-4 cursor-pointer hover:ring-2 hover:ring-blue-500" onClick={() => setStatusFilter('open')}>
                    <p className="text-blue-400 text-sm">Open</p>
                    <p className="text-2xl font-bold text-white">{stats.open}</p>
                </div>
                <div className="card p-4 cursor-pointer hover:ring-2 hover:ring-yellow-500" onClick={() => setStatusFilter('in_progress')}>
                    <p className="text-yellow-400 text-sm">In Progress</p>
                    <p className="text-2xl font-bold text-white">{stats.in_progress}</p>
                </div>
                <div className="card p-4 cursor-pointer hover:ring-2 hover:ring-green-500" onClick={() => setStatusFilter('resolved')}>
                    <p className="text-green-400 text-sm">Resolved</p>
                    <p className="text-2xl font-bold text-white">{stats.resolved}</p>
                </div>
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-dark-500" />
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="select"
                >
                    <option value="all">All Tickets</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                </select>
            </div>

            {/* Tickets Table */}
            <div className="card overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="spinner text-primary-400 mx-auto mb-4" />
                        <p className="text-dark-400">Loading tickets...</p>
                    </div>
                ) : filteredTickets.length === 0 ? (
                    <div className="p-12 text-center">
                        <HelpCircle className="w-16 h-16 text-dark-600 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No tickets</h3>
                        <p className="text-dark-400">No support tickets to display</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Ticket</th>
                                    <th>User</th>
                                    <th>Status</th>
                                    <th>Priority</th>
                                    <th>Category</th>
                                    <th>Created</th>
                                    <th className="w-10"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredTickets.map((ticket) => (
                                    <tr key={ticket.id} className="hover:bg-dark-800/50">
                                        <td>
                                            <div>
                                                <p className="text-white font-medium">{ticket.subject}</p>
                                                <p className="text-dark-500 text-sm line-clamp-1">{ticket.description}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-dark-500" />
                                                <div>
                                                    <p className="text-white text-sm">{ticket.user_profiles?.full_name || 'Unknown'}</p>
                                                    <p className="text-dark-500 text-xs">{ticket.user_profiles?.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                value={ticket.status}
                                                onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                                                className={`text-xs px-2 py-1 rounded-lg border ${statusColors[ticket.status]} bg-transparent cursor-pointer`}
                                            >
                                                <option value="open">Open</option>
                                                <option value="in_progress">In Progress</option>
                                                <option value="resolved">Resolved</option>
                                                <option value="closed">Closed</option>
                                            </select>
                                        </td>
                                        <td>
                                            <span className={`text-sm font-medium ${priorityColors[ticket.priority]}`}>
                                                {ticket.priority}
                                            </span>
                                        </td>
                                        <td className="text-dark-400 text-sm">{ticket.category}</td>
                                        <td className="text-dark-500 text-sm">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                {formatDate(ticket.created_at)}
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => openTicketDetails(ticket)}
                                                className="btn-ghost btn-sm"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Ticket Details Modal */}
            {selectedTicket && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTicket(null)}>
                    <div className="glass-card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        {/* Header */}
                        <div className="p-6 border-b border-dark-700">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                                        <span className={`badge border ${statusColors[selectedTicket.status]}`}>
                                            {selectedTicket.status.replace('_', ' ')}
                                        </span>
                                        <span className={`text-sm ${priorityColors[selectedTicket.priority]}`}>
                                            {selectedTicket.priority} priority
                                        </span>
                                        <span className="text-dark-500 text-sm">
                                            {selectedTicket.user_profiles?.email}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value)}
                                        className="select text-sm"
                                    >
                                        <option value="open">Open</option>
                                        <option value="in_progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="closed">Closed</option>
                                    </select>
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
                                <div className="flex items-center gap-2 mb-2">
                                    <User className="w-4 h-4 text-dark-500" />
                                    <span className="text-white text-sm font-medium">
                                        {selectedTicket.user_profiles?.full_name || 'User'}
                                    </span>
                                    <span className="text-dark-500 text-xs">{formatDate(selectedTicket.created_at)}</span>
                                </div>
                                <p className="text-dark-300">{selectedTicket.description}</p>
                                {selectedTicket.attachment_url && (
                                    <div className="mt-3">
                                        <a href={selectedTicket.attachment_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                                            <img
                                                src={selectedTicket.attachment_url}
                                                alt="Attachment"
                                                className="max-h-64 rounded-lg cursor-pointer hover:opacity-80 border border-dark-600"
                                            />
                                        </a>
                                    </div>
                                )}
                            </div>

                            {/* Messages */}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`p-4 rounded-xl ${msg.is_admin ? 'bg-primary-500/10 border border-primary-500/30 ml-8' : 'bg-dark-800/50 mr-8'
                                        }`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className={`text-sm font-medium ${msg.is_admin ? 'text-primary-400' : 'text-white'}`}>
                                            {msg.is_admin ? 'Support Team (You)' : 'Customer'}
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
                        <div className="p-4 border-t border-dark-700">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                                    placeholder="Type your response..."
                                    className="input flex-1"
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={sending || !newMessage.trim()}
                                    className="btn-primary"
                                >
                                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
