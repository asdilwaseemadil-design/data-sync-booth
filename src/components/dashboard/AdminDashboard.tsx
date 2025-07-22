import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  Download, 
  Search,
  Eye,
  Shield,
  BarChart3,
  User
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ContactData {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  position: string;
  address: string;
  website: string;
  notes: string;
  submittedAt: string;
  userId: string;
}

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export const AdminDashboard: React.FC = () => {
  const [allSubmissions, setAllSubmissions] = useState<ContactData[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<ContactData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState<string>('all');
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const loadData = () => {
    // Load all submissions
    const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    setAllSubmissions(submissions);
    setFilteredSubmissions(submissions);

    // Load all users
    const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    const usersList = registeredUsers.filter((u: any) => u.role === 'user');
    setUsers(usersList);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    let filtered = allSubmissions;

    // Filter by user
    if (selectedUser !== 'all') {
      filtered = filtered.filter(sub => sub.userId === selectedUser);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.phone.includes(searchTerm)
      );
    }

    setFilteredSubmissions(filtered);
  }, [allSubmissions, selectedUser, searchTerm]);

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'Address', 'Website', 'Notes', 'Submitted At', 'User ID'];
    const csvContent = [
      headers.join(','),
      ...filteredSubmissions.map(sub => [
        sub.name,
        sub.email,
        sub.phone,
        sub.company,
        sub.position,
        sub.address,
        sub.website,
        sub.notes,
        new Date(sub.submittedAt).toLocaleString(),
        sub.userId
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin_all_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "All contact data has been exported to CSV",
    });
  };

  const getStats = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthSubmissions = allSubmissions.filter(sub => 
      new Date(sub.submittedAt) >= thisMonth
    );

    const uniqueCompanies = new Set(allSubmissions.map(sub => sub.company)).size;
    const activeUsers = new Set(allSubmissions.map(sub => sub.userId)).size;

    return {
      totalSubmissions: allSubmissions.length,
      thisMonthSubmissions: thisMonthSubmissions.length,
      uniqueCompanies,
      totalUsers: users.length,
      activeUsers
    };
  };

  const getUserSubmissionCount = (userId: string) => {
    return allSubmissions.filter(sub => sub.userId === userId).length;
  };

  const getUserName = (userId: string) => {
    const foundUser = users.find(u => u.id === userId);
    return foundUser ? foundUser.name : 'Unknown User';
  };

  const stats = getStats();

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Shield className="text-primary" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Manage all users and contact submissions</p>
        </div>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All user submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonthSubmissions}</div>
            <p className="text-xs text-muted-foreground">New submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Companies</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueCompanies}</div>
            <p className="text-xs text-muted-foreground">Unique organizations</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="submissions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="submissions">All Submissions</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="submissions" className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full sm:w-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search submissions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="px-3 py-2 border border-input bg-background text-sm rounded-md"
              >
                <option value="all">All Users</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>
                    {user.name} ({getUserSubmissionCount(user.id)})
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {filteredSubmissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedUser !== 'all' 
                    ? 'Try adjusting your search criteria'
                    : 'No contact submissions have been made yet'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredSubmissions.map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <h3 className="font-semibold">{submission.name}</h3>
                          <p className="text-sm text-muted-foreground">{submission.position}</p>
                        </div>
                        <div>
                          <p className="font-medium">{submission.company}</p>
                          <p className="text-sm text-muted-foreground">{submission.email}</p>
                        </div>
                        <div>
                          <p className="text-sm">{submission.phone}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(submission.submittedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Badge variant="outline" className="text-xs">
                            <User size={12} className="mr-1" />
                            {getUserName(submission.userId)}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center text-sm text-muted-foreground">
            Showing {filteredSubmissions.length} of {allSubmissions.length} submissions
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">User Management</h2>
          </div>

          {users.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No users registered</h3>
                <p className="text-muted-foreground">No users have registered yet</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {users.map((userData) => (
                <Card key={userData.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <h3 className="font-semibold">{userData.name}</h3>
                          <p className="text-sm text-muted-foreground">{userData.email}</p>
                        </div>
                        <div>
                          <p className="text-sm">
                            <span className="font-medium">Role:</span> {userData.role}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Joined: {new Date(userData.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <Badge variant="secondary">
                            {getUserSubmissionCount(userData.id)} submissions
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Platform Analytics
              </CardTitle>
              <CardDescription>
                Overview of platform performance and usage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-semibold">Submission Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Total Submissions</span>
                        <Badge variant="secondary">{stats.totalSubmissions}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>This Month</span>
                        <Badge variant="secondary">{stats.thisMonthSubmissions}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Unique Companies</span>
                        <Badge variant="secondary">{stats.uniqueCompanies}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold">User Stats</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Registered Users</span>
                        <Badge variant="secondary">{stats.totalUsers}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Active Users</span>
                        <Badge variant="secondary">{stats.activeUsers}</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Avg Submissions/User</span>
                        <Badge variant="outline">
                          {stats.totalUsers > 0 ? Math.round(stats.totalSubmissions / stats.totalUsers) : 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};