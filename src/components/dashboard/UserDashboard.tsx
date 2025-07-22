import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/components/auth/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { ContactForm } from '@/components/forms/ContactForm';
import { BusinessCardScanner } from '@/components/scanner/BusinessCardScanner';
import { WhatsAppQRScanner } from '@/components/scanner/WhatsAppQRScanner';
import { 
  Users, 
  Building2, 
  Calendar, 
  FileText, 
  Download, 
  Edit, 
  Eye,
  Plus,
  Scan,
  MessageSquare,
  BarChart3
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

export const UserDashboard: React.FC = () => {
  const [submissions, setSubmissions] = useState<ContactData[]>([]);
  const [recentSubmissions, setRecentSubmissions] = useState<ContactData[]>([]);
  const [showAllSubmissions, setShowAllSubmissions] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactData | null>(null);
  const [scannerData, setScannerData] = useState<any>(null);
  const { user, logout } = useAuth();
  const { toast } = useToast();

  const loadSubmissions = () => {
    const allSubmissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
    const userSubmissions = allSubmissions.filter((sub: ContactData) => sub.userId === user?.id);
    setSubmissions(userSubmissions);
    setRecentSubmissions(userSubmissions.slice(0, 3));
  };

  useEffect(() => {
    loadSubmissions();
  }, [user?.id]);

  const handleScannerData = (data: any) => {
    setScannerData(data);
    toast({
      title: "Data Extracted",
      description: "Scanner data has been loaded into the form. Please review and submit.",
    });
  };

  const handleFormSubmit = (data: ContactData) => {
    loadSubmissions();
    setScannerData(null);
    setEditingContact(null);
  };

  const handleEdit = (contact: ContactData) => {
    setEditingContact(contact);
  };

  const exportToCSV = () => {
    if (submissions.length === 0) {
      toast({
        title: "No Data",
        description: "No submissions to export",
        variant: "destructive",
      });
      return;
    }

    const headers = ['Name', 'Email', 'Phone', 'Company', 'Position', 'Address', 'Website', 'Notes', 'Submitted At'];
    const csvContent = [
      headers.join(','),
      ...submissions.map(sub => [
        sub.name,
        sub.email,
        sub.phone,
        sub.company,
        sub.position,
        sub.address,
        sub.website,
        sub.notes,
        new Date(sub.submittedAt).toLocaleString()
      ].map(field => `"${field}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `contacts_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast({
      title: "Export Successful",
      description: "Your contacts have been exported to CSV",
    });
  };

  const getStats = () => {
    const thisMonth = new Date();
    thisMonth.setDate(1);
    thisMonth.setHours(0, 0, 0, 0);

    const thisMonthSubmissions = submissions.filter(sub => 
      new Date(sub.submittedAt) >= thisMonth
    );

    const uniqueCompanies = new Set(submissions.map(sub => sub.company)).size;

    return {
      totalSubmissions: submissions.length,
      thisMonthSubmissions: thisMonthSubmissions.length,
      uniqueCompanies
    };
  };

  const stats = getStats();

  if (editingContact) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => setEditingContact(null)}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
        </div>
        <ContactForm
          initialData={editingContact}
          onSubmit={handleFormSubmit}
          isEditing={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user?.name}</h1>
          <p className="text-muted-foreground">Manage your contact submissions and capture new leads</p>
        </div>
        <Button onClick={logout} variant="outline">
          Logout
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubmissions}</div>
            <p className="text-xs text-muted-foreground">All time contacts</p>
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
      <Tabs defaultValue="capture" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="capture">Capture Data</TabsTrigger>
          <TabsTrigger value="submissions">Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="capture" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <BusinessCardScanner onDataExtracted={handleScannerData} />
            <WhatsAppQRScanner onDataExtracted={handleScannerData} />
          </div>
          
          <ContactForm 
            initialData={scannerData} 
            onSubmit={handleFormSubmit}
          />
        </TabsContent>

        <TabsContent value="submissions" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Submissions</h2>
            <Button onClick={exportToCSV} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>

          {submissions.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No submissions yet</h3>
                <p className="text-muted-foreground mb-4">Start by capturing contact data using the scanners or manual entry</p>
                <Button onClick={() => {
                  const captureTab = document.querySelector('[value="capture"]') as HTMLElement;
                  captureTab?.click();
                }}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Contact
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {(showAllSubmissions ? submissions : recentSubmissions).map((submission) => (
                <Card key={submission.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleEdit(submission)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {!showAllSubmissions && submissions.length > 3 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllSubmissions(true)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All {submissions.length} Submissions
                  </Button>
                </div>
              )}

              {showAllSubmissions && submissions.length > 3 && (
                <div className="text-center">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowAllSubmissions(false)}
                  >
                    Show Recent Only
                  </Button>
                </div>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 size={20} />
                Submission Analytics
              </CardTitle>
              <CardDescription>
                Overview of your contact capture performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Total Contacts</span>
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
                {submissions.length > 0 && (
                  <div className="flex justify-between items-center">
                    <span>Last Submission</span>
                    <Badge variant="outline">
                      {new Date(submissions[0].submittedAt).toLocaleDateString()}
                    </Badge>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};