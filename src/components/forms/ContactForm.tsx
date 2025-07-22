import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Save, Edit, Plus, Upload } from 'lucide-react';

interface ContactData {
  id?: string;
  rep: string;
  relevancy: string;
  companyName: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  whatsapp: string;
  partnerDetails: string[];
  targetRegions: string[];
  lob: string[];
  tier: string;
  grades: string[];
  volume: string;
  addAssociates: string;
  notes: string;
  businessCardUrl: string;
  submittedAt: string;
  userId: string;
}

interface ContactFormProps {
  initialData?: Partial<ContactData>;
  onSubmit?: (data: ContactData) => void;
  isEditing?: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({ 
  initialData, 
  onSubmit,
  isEditing = false 
}) => {
  const [formData, setFormData] = useState<ContactData>({
    rep: '',
    relevancy: '',
    companyName: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    whatsapp: '',
    partnerDetails: [],
    targetRegions: [],
    lob: [],
    tier: '',
    grades: [],
    volume: '',
    addAssociates: 'no',
    notes: '',
    businessCardUrl: '',
    submittedAt: new Date().toISOString(),
    userId: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [businessCardFile, setBusinessCardFile] = useState<File | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  // Form options
  const repOptions = ['Itzik Cohen', 'Scott Cowie', 'Bruno Do Carmo', 'Praveen Arora', 'Gil Hanono'];
  const relevancyOptions = ['Never done business', 'Done business within the last 6 months', 'Done business in the past', 'Not ideal customer'];
  const partnerOptions = ['Carrier/MVNO', 'Enterprise', 'Insurance Provider', 'Retail', 'Trader', 'Distributor', 'E-tail (D2C)', 'E-tail (Marketplace)'];
  const regionOptions = ['Middle East', 'Europe', 'USA', 'LATAM', 'Asia (Japan, Hongkong)', 'Australia', 'China', 'Africa'];
  const lobOptions = ['Phones', 'Tablets', 'Accessories', 'Computers', 'Wearables', 'Smart Home', 'Consumer Electronics'];
  const tierOptions = ['New', 'Lower Grade', 'Higher Grade', 'All Grades', 'Repair Stock'];
  const gradesOptions = ['New', 'ASIS', 'CPO', 'CRD', 'C2', 'C4', 'D2', 'D3', 'TBG'];
  const volumeOptions = ['Under 100', 'Under 500', 'Under 1000', 'Over 2000 units per month'];

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, userId: user.id }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleCheckboxChange = (field: 'partnerDetails' | 'targetRegions' | 'lob' | 'grades', value: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked
        ? [...prev[field], value]
        : prev[field].filter(item => item !== value),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setBusinessCardFile(file);
      const imageUrl = URL.createObjectURL(file);
      setFormData(prev => ({ ...prev, businessCardUrl: imageUrl }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData: ContactData = {
        ...formData,
        id: formData.id || Date.now().toString(),
        submittedAt: isEditing ? formData.submittedAt : new Date().toISOString()
      };

      // Save to localStorage (replace with actual API call)
      const submissions = JSON.parse(localStorage.getItem('contactSubmissions') || '[]');
      
      if (isEditing && formData.id) {
        const index = submissions.findIndex((s: ContactData) => s.id === formData.id);
        if (index !== -1) {
          submissions[index] = submissionData;
        }
      } else {
        submissions.unshift(submissionData);
      }
      
      localStorage.setItem('contactSubmissions', JSON.stringify(submissions));

      toast({
        title: "Success",
        description: isEditing ? "Contact updated successfully!" : "Contact saved successfully!",
      });

      if (onSubmit) {
        onSubmit(submissionData);
      }

      // Reset form if not editing
      if (!isEditing) {
        setFormData({
          rep: '',
          relevancy: '',
          companyName: '',
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          whatsapp: '',
          partnerDetails: [],
          targetRegions: [],
          lob: [],
          tier: '',
          grades: [],
          volume: '',
          addAssociates: 'no',
          notes: '',
          businessCardUrl: '',
          submittedAt: new Date().toISOString(),
          userId: user?.id || ''
        });
      }
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: "Failed to save contact information",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    handleInputChange(name, value);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? <Edit size={20} /> : <Plus size={20} />}
          {isEditing ? 'Edit Contact' : 'Add New Contact'}
        </CardTitle>
        <CardDescription>
          {isEditing ? 'Update contact information' : 'Enter contact details manually or use scanner above'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rep">Select Rep</Label>
                  <Select value={formData.rep} onValueChange={(value) => handleInputChange('rep', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rep" />
                    </SelectTrigger>
                    <SelectContent>
                      {repOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="relevancy">Relevancy</Label>
                  <Select value={formData.relevancy} onValueChange={(value) => handleInputChange('relevancy', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select relevancy" />
                    </SelectTrigger>
                    <SelectContent>
                      {relevancyOptions.map(option => (
                        <SelectItem key={option} value={option}>{option}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="companyName">Company Name</Label>
                <Input
                  id="companyName"
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleChange}
                  placeholder="Company name"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={errors.firstName ? 'border-destructive' : ''}
                    required
                  />
                  {errors.firstName && <p className="text-sm text-destructive">{errors.firstName}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={errors.lastName ? 'border-destructive' : ''}
                    required
                  />
                  {errors.lastName && <p className="text-sm text-destructive">{errors.lastName}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-destructive' : ''}
                  required
                />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
                <div>
                  <Label htmlFor="whatsapp">WhatsApp Number</Label>
                  <Input
                    id="whatsapp"
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleChange}
                    placeholder="+1 234 567 8900"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Partner Details */}
          <Card>
            <CardHeader>
              <CardTitle>Partner Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {partnerOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`partner-${option}`}
                      checked={formData.partnerDetails.includes(option)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('partnerDetails', option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`partner-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Target Regions */}
          <Card>
            <CardHeader>
              <CardTitle>Target Regions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {regionOptions.map(region => (
                  <div key={region} className="flex items-center space-x-2">
                    <Checkbox
                      id={`region-${region}`}
                      checked={formData.targetRegions.includes(region)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('targetRegions', region, checked as boolean)
                      }
                    />
                    <Label htmlFor={`region-${region}`}>{region}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Line of Business */}
          <Card>
            <CardHeader>
              <CardTitle>Line of Business (LOB)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lobOptions.map(option => (
                  <div key={option} className="flex items-center space-x-2">
                    <Checkbox
                      id={`lob-${option}`}
                      checked={formData.lob.includes(option)}
                      onCheckedChange={(checked) => 
                        handleCheckboxChange('lob', option, checked as boolean)
                      }
                    />
                    <Label htmlFor={`lob-${option}`}>{option}</Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tier & Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Tier & Grades</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="tier">Tier</Label>
                <Select value={formData.tier} onValueChange={(value) => handleInputChange('tier', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tier" />
                  </SelectTrigger>
                  <SelectContent>
                    {tierOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-base font-medium mb-3 block">Grades</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {gradesOptions.map(grade => (
                    <div key={grade} className="flex items-center space-x-2">
                      <Checkbox
                        id={`grade-${grade}`}
                        checked={formData.grades.includes(grade)}
                        onCheckedChange={(checked) => 
                          handleCheckboxChange('grades', grade, checked as boolean)
                        }
                      />
                      <Label htmlFor={`grade-${grade}`}>{grade}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Volume */}
          <Card>
            <CardHeader>
              <CardTitle>Volume</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={formData.volume} onValueChange={(value) => handleInputChange('volume', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select volume range" />
                </SelectTrigger>
                <SelectContent>
                  {volumeOptions.map(option => (
                    <SelectItem key={option} value={option}>{option}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Add Associates */}
          <Card>
            <CardHeader>
              <CardTitle>Add Associates Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-6">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="associates-yes"
                    name="addAssociates"
                    value="yes"
                    checked={formData.addAssociates === 'yes'}
                    onChange={(e) => handleInputChange('addAssociates', e.target.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="associates-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="associates-no"
                    name="addAssociates"
                    value="no"
                    checked={formData.addAssociates === 'no'}
                    onChange={(e) => handleInputChange('addAssociates', e.target.value)}
                    className="h-4 w-4"
                  />
                  <Label htmlFor="associates-no">No</Label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Information */}
          <Card>
            <CardHeader>
              <CardTitle>Additional Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Additional notes or comments..."
                />
              </div>

              <div>
                <Label htmlFor="businessCard">Upload Business Card</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="businessCard"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => document.getElementById('businessCard')?.click()}
                    className="w-full"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {businessCardFile ? businessCardFile.name : 'Choose file'}
                  </Button>
                </div>
                {formData.businessCardUrl && (
                  <div className="mt-4">
                    <img
                      src={formData.businessCardUrl}
                      alt="Business card preview"
                      className="max-w-xs rounded-lg border"
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : isEditing ? "Update Contact" : "Save Contact"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};