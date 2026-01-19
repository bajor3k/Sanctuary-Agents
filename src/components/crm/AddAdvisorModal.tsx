"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Search } from "lucide-react";

// Interface for form data
interface AdvisorFormData {
  // Person Fields
  prefix: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  nickname: string;
  maritalStatus: string;
  jobTitle: string;
  company: string;
  householdRole: string;
  householdName: string;

  // Household Fields
  headName: string;
  spouseName: string;
  status: string;

  // Shared / Common
  email: string;
  emailType: string;
  emailPrimary: boolean;
  phone: string;
  phoneExt: string;
  phoneType: string;
  phonePrimary: boolean;
  tags: string;
  backgroundInfo: string;

  // Trust Fields
  trustName: string;
  website: string;
  street: string;
  street2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  taxId: string;
  contactSource: string;
}

const initialFormData: AdvisorFormData = {
  prefix: "", firstName: "", middleName: "", lastName: "", suffix: "",
  nickname: "",
  maritalStatus: "",
  jobTitle: "", company: "",
  householdRole: "Head", householdName: "",
  headName: "", spouseName: "", status: "",
  email: "", emailType: "Work", emailPrimary: true,
  phone: "", phoneExt: "", phoneType: "Work", phonePrimary: true,
  tags: "", backgroundInfo: "",
  trustName: "", website: "", street: "", street2: "", city: "", state: "", zip: "", country: "", taxId: "", contactSource: "",
};

type ContactType = 'Person' | 'Household' | 'Company' | 'Trust';

export function AddAdvisorModal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState<AdvisorFormData>(initialFormData);
  const [contactType, setContactType] = useState<ContactType>('Person');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (e.target.type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`Form submitted (${contactType}):`, formData);
    setOpen(false);
    setFormData(initialFormData);
    setContactType('Person');
  };

  const inputStyles = "flex h-10 w-full rounded-md border border-zinc-300/80 bg-white/50 px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-zinc-900/50 dark:text-white dark:placeholder:text-zinc-500";
  const checkboxStyles = "h-5 w-5 rounded border-zinc-300 text-green-600 focus:ring-green-600 dark:border-zinc-700 dark:bg-zinc-800 dark:checked:bg-green-600";
  const labelStyles = "block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1";

  // Helper to render type selector in title
  const renderTypeSelector = () => {
    const types: ContactType[] = ['Person', 'Household', 'Company', 'Trust'];

    // Logic: "Add a new [ActiveType] -or- add a new [Others...]"
    // The user request was specific: "Add a new Household -or- add a new Person | Company | Trust"

    return (
      <div className="flex flex-wrap items-center gap-2 text-lg font-medium text-zinc-900 dark:text-white">
        <span className="text-zinc-500 dark:text-zinc-400">Add a new</span>
        <span className="font-bold">{contactType}</span>
        <span className="text-zinc-500 dark:text-zinc-400">-or- add a new</span>
        <div className="flex items-center gap-1">
          {types.filter(t => t !== contactType).map((t, i, arr) => (
            <React.Fragment key={t}>
              <button
                type="button"
                onClick={() => setContactType(t)}
                className="text-blue-600 hover:underline dark:text-blue-400"
              >
                {t}
              </button>
              {i < arr.length - 1 && <span className="text-zinc-400">|</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white/80 dark:bg-black/60 backdrop-blur-xl border-zinc-200 dark:border-white/10 p-0 gap-0 [&>button]:hidden shadow-2xl">

        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-zinc-200/50 dark:border-white/10 bg-transparent flex flex-row items-center justify-between">
          <DialogTitle asChild>
            {renderTypeSelector()}
          </DialogTitle>
          <DialogClose asChild>
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-white">Cancel</Button>
          </DialogClose>
        </DialogHeader>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">

          {/* ================= PERSON FORM ================= */}
          {contactType === 'Person' && (
            <>
              {/* Row 1: Name */}
              <div>
                <label className={labelStyles}>Name</label>
                <div className="grid grid-cols-12 gap-3">
                  <input name="prefix" placeholder="Prefix" value={formData.prefix} onChange={handleChange} className={`${inputStyles} col-span-2`} />
                  <input name="firstName" placeholder="First" value={formData.firstName} onChange={handleChange} className={`${inputStyles} col-span-3`} />
                  <input name="middleName" placeholder="Middle" value={formData.middleName} onChange={handleChange} className={`${inputStyles} col-span-2`} />
                  <input name="lastName" placeholder="Last" value={formData.lastName} onChange={handleChange} className={`${inputStyles} col-span-3`} />
                  <input name="suffix" placeholder="Suffix" value={formData.suffix} onChange={handleChange} className={`${inputStyles} col-span-2`} />
                </div>
              </div>

              {/* Row 2: Nickname */}
              <div>
                <label className={labelStyles}>Nickname</label>
                <input name="nickname" value={formData.nickname} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Row 3: Marital Status */}
              <div>
                <label className={labelStyles}>Marital Status</label>
                <select name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} className={inputStyles}>
                  <option value="">Select...</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                </select>
              </div>

              {/* Row 4: Company */}
              <div>
                <label className={labelStyles}>Company</label>
                <div className="grid grid-cols-2 gap-4">
                  <input name="jobTitle" placeholder="Job Title" value={formData.jobTitle} onChange={handleChange} className={inputStyles} />
                  <input name="company" placeholder="Company" value={formData.company} onChange={handleChange} className={inputStyles} />
                </div>
              </div>

              {/* Row 5: Household */}
              <div>
                <label className={labelStyles}>Household</label>
                <div className="grid grid-cols-12 gap-4">
                  <select name="householdRole" value={formData.householdRole} onChange={handleChange} className={`${inputStyles} col-span-3`}>
                    <option value="Head">Head</option>
                    <option value="Spouse">Spouse</option>
                    <option value="Dependent">Dependent</option>
                  </select>
                  <input name="householdName" placeholder="Household Name" value={formData.householdName} onChange={handleChange} className={`${inputStyles} col-span-9`} />
                </div>
              </div>

              {/* Shared Fields (Email, Phone, Tags, Background) - Could be componentized but inline for now */}
              <div>
                <label className={labelStyles}>Email Address</label>
                <div className="flex items-center gap-3">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={`${inputStyles} flex-grow`} />
                  <select name="emailType" value={formData.emailType} onChange={handleChange} className={`${inputStyles} w-32`}>
                    <option value="Work">Work</option>
                    <option value="Personal">Personal</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="emailPrimary" checked={formData.emailPrimary} onChange={handleChange} className={checkboxStyles} />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Primary?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelStyles}>Phone Number</label>
                <div className="flex items-center gap-3">
                  <input name="phone" placeholder="(###) ###-####" value={formData.phone} onChange={handleChange} className={`${inputStyles} flex-grow`} />
                  <input name="phoneExt" placeholder="Ext." value={formData.phoneExt} onChange={handleChange} className={`${inputStyles} w-24`} />
                  <select name="phoneType" value={formData.phoneType} onChange={handleChange} className={`${inputStyles} w-32`}>
                    <option value="Work">Work</option>
                    <option value="Mobile">Mobile</option>
                    <option value="Home">Home</option>
                  </select>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="phonePrimary" checked={formData.phonePrimary} onChange={handleChange} className={checkboxStyles} />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">Primary?</span>
                  </label>
                </div>
              </div>

              <div>
                <label className={labelStyles}>Tags</label>
                <input name="tags" placeholder="Tag names (e.g., client, friend)..." value={formData.tags} onChange={handleChange} className={inputStyles} />
              </div>

              <div>
                <label className={labelStyles}>Background Information</label>
                <textarea name="backgroundInfo" rows={4} value={formData.backgroundInfo} onChange={handleChange} className={`${inputStyles} h-auto resize-y`} />
              </div>
            </>
          )}


          {/* ================= HOUSEHOLD FORM ================= */}
          {contactType === 'Household' && (
            <>
              {/* Name */}
              <div>
                <label className={labelStyles}>Name</label>
                <input name="householdName" placeholder="Household Name" value={formData.householdName} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Members */}
              <div className="space-y-3">
                <label className={labelStyles}>Members</label>

                {/* Head */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">Head</div>
                  <div className="col-span-10 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      name="headName"
                      placeholder="Find contact name..."
                      value={formData.headName}
                      onChange={handleChange}
                      className={`${inputStyles} pl-9`}
                    />
                  </div>
                </div>

                {/* Spouse */}
                <div className="grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-2 text-sm text-zinc-500 dark:text-zinc-400">Spouse</div>
                  <div className="col-span-10 relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <Search className="h-4 w-4" />
                    </div>
                    <input
                      name="spouseName"
                      placeholder="Find contact name..."
                      value={formData.spouseName}
                      onChange={handleChange}
                      className={`${inputStyles} pl-9`}
                    />
                  </div>
                </div>
              </div>

              {/* Email - Defaults to Work as per request? Request said "Email Address" then "Work" underneath or next to it? 
                  Request: "Email Address [newlines] Work" -> implies Label then Field(Work)
              */}
              <div>
                <label className={labelStyles}>Email Address</label>
                <div className="flex items-center gap-3">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyles} />
                  <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Work
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelStyles}>Tags</label>
                <input name="tags" placeholder="Tag names (e.g., client, friend)..." value={formData.tags} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Background Info */}
              <div>
                <label className={labelStyles}>Background Information</label>
                <textarea name="backgroundInfo" rows={4} value={formData.backgroundInfo} onChange={handleChange} className={`${inputStyles} h-auto resize-y`} />
              </div>

              {/* Status */}
              <div>
                <label className={labelStyles}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                  <option value="">Select status...</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>

            </>
          )}

          {/* ================= COMPANY FORM ================= */}
          {contactType === 'Company' && (
            <>
              {/* Company Name */}
              <div>
                <label className={labelStyles}>Company Name</label>
                <input name="company" placeholder="Company Name" value={formData.company} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Email - Defaults to Work */}
              <div>
                <label className={labelStyles}>Email Address</label>
                <div className="flex items-center gap-3">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyles} />
                  <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Work
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelStyles}>Phone Number</label>
                <div className="flex items-center gap-3">
                  <input name="phone" placeholder="(###) ###-####" value={formData.phone} onChange={handleChange} className={`${inputStyles} flex-grow`} />
                  <input name="phoneExt" placeholder="Ext." value={formData.phoneExt} onChange={handleChange} className={`${inputStyles} w-24`} />
                  <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Work
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelStyles}>Tags</label>
                <input name="tags" placeholder="Tag names (e.g., client, friend)..." value={formData.tags} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Background Info */}
              <div>
                <label className={labelStyles}>Background Information</label>
                <textarea name="backgroundInfo" rows={4} value={formData.backgroundInfo} onChange={handleChange} className={`${inputStyles} h-auto resize-y`} />
              </div>

            </>
          )}

          {/* ================= TRUST FORM ================= */}
          {contactType === 'Trust' && (
            <>
              {/* Name */}
              <div>
                <label className={labelStyles}>Name</label>
                <div className="grid grid-cols-1 gap-3">
                  <input name="trustName" placeholder="Trust Name" value={formData.trustName} onChange={handleChange} className={inputStyles} />
                </div>
              </div>

              {/* Email - Defaults to Work */}
              <div>
                <label className={labelStyles}>Email Address</label>
                <div className="flex items-center gap-3">
                  <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputStyles} />
                  <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Work
                  </div>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className={labelStyles}>Phone Number</label>
                <div className="flex items-center gap-3">
                  <input name="phone" placeholder="(###) ###-####" value={formData.phone} onChange={handleChange} className={`${inputStyles} flex-grow`} />
                  <input name="phoneExt" placeholder="Ext." value={formData.phoneExt} onChange={handleChange} className={`${inputStyles} w-24`} />
                  <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Work
                  </div>
                </div>
              </div>

              {/* Website */}
              <div>
                <label className={labelStyles}>Website</label>
                <div className="flex items-center gap-3">
                  <input name="website" placeholder="Website" value={formData.website} onChange={handleChange} className={inputStyles} />
                  <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                    Website
                  </div>
                </div>
              </div>

              {/* Address */}
              <div>
                <label className={labelStyles}>Street Address</label>
                <div className="space-y-3">
                  <input name="street" placeholder="Street Address" value={formData.street} onChange={handleChange} className={inputStyles} />
                  <input name="street2" placeholder="Street Address 2" value={formData.street2} onChange={handleChange} className={inputStyles} />
                  <div className="grid grid-cols-2 gap-3">
                    <input name="city" placeholder="City" value={formData.city} onChange={handleChange} className={inputStyles} />
                    <input name="state" placeholder="State" value={formData.state} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input name="zip" placeholder="Zip" value={formData.zip} onChange={handleChange} className={inputStyles} />
                    <input name="country" placeholder="Country" value={formData.country} onChange={handleChange} className={inputStyles} />
                  </div>
                  <div className="flex items-center justify-start">
                    <div className="flex items-center justify-center px-3 py-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700">
                      Work
                    </div>
                  </div>
                </div>
              </div>

              {/* Tags */}
              <div>
                <label className={labelStyles}>Tags</label>
                <input name="tags" placeholder="Tag names (e.g., client, friend)..." value={formData.tags} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Background Info */}
              <div>
                <label className={labelStyles}>Background Information</label>
                <textarea name="backgroundInfo" rows={4} value={formData.backgroundInfo} onChange={handleChange} className={`${inputStyles} h-auto resize-y`} />
              </div>

              {/* Tax ID */}
              <div>
                <label className={labelStyles}>Tax ID</label>
                <input name="taxId" placeholder="00-0000000" value={formData.taxId} onChange={handleChange} className={inputStyles} />
              </div>

              {/* Contact Source */}
              <div>
                <label className={labelStyles}>Contact Source</label>
                <select name="contactSource" value={formData.contactSource} onChange={handleChange} className={inputStyles}>
                  <option value="">Select...</option>
                  <option value="Referral">Referral</option>
                  <option value="Event">Event</option>
                  <option value="Cold Call">Cold Call</option>
                </select>
              </div>

              {/* Status */}
              <div>
                <label className={labelStyles}>Status</label>
                <select name="status" value={formData.status} onChange={handleChange} className={inputStyles}>
                  <option value="">Select status...</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Prospect">Prospect</option>
                </select>
              </div>

            </>
          )}

          {!['Person', 'Household', 'Company', 'Trust'].includes(contactType) && null}

          <button type="button" className="text-sm text-blue-600 hover:underline dark:text-blue-400">Show Additional Fields</button>

        </form>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-zinc-200/50 dark:border-white/10 bg-transparent">
          <Button type="submit" onClick={handleSubmit} className="bg-green-600 hover:bg-green-700 text-white font-medium border-none shadow-sm">
            Add {contactType}
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}
