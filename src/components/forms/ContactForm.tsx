import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/auth/AuthContext';
import { Save, Edit, Plus } from 'lucide-react';

interface ContactData {
  id?: string;
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
    name: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    address: '',
    website: '',
    notes: '',
    submittedAt: new Date().toISOString(),
    userId: '',
    ...initialData
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setFormData(prev => ({ ...prev, userId: user.id }));
    }
  }, [user]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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
          name: '',
          email: '',
          phone: '',
          company: '',
          position: '',
          address: '',
          website: '',
          notes: '',
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
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
            </div>

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
              />
              {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={errors.phone ? 'border-destructive' : ''}
              />
              {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">
                Company <span className="text-destructive">*</span>
              </Label>
              <Input
                id="company"
                name="company"
                value={formData.company}
                onChange={handleChange}
                className={errors.company ? 'border-destructive' : ''}
              />
              {errors.company && <p className="text-sm text-destructive">{errors.company}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="position">
                Position <span className="text-destructive">*</span>
              </Label>
              <Input
                id="position"
                name="position"
                value={formData.position}
                onChange={handleChange}
                className={errors.position ? 'border-destructive' : ''}
              />
              {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                name="website"
                value={formData.website}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            <Save className="h-4 w-4 mr-2" />
            {isSubmitting ? "Saving..." : isEditing ? "Update Contact" : "Save Contact"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};