'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LucideIcon } from '@/components/ui/LucideIcon';

interface PetProfileProps {
  profileId: string;
}

interface PetProfileData {
  profile_id: string;
  order_id: string;
  status: string;
  pet_name: string;
  pet_type: string;
  pet_breed?: string;
  pet_age?: string;
  pet_photo?: string;
  public_message?: string;
  contact_method: 'whatsapp' | 'call' | 'both';
  owner_phone: string;
  alt_phone?: string;
  emergency_enabled?: boolean;
  emergency_name?: string;
  emergency_phone?: string;
  medical_info?: string;
  message?: string;
}

export default function PetProfilePage({ profileId }: PetProfileProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<PetProfileData | null>(null);
  const [isInactive, setIsInactive] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetch(`/api/order?profileId=${profileId}`);
        if (!res.ok) {
          if (res.status === 404) {
            setError('Pet Profile Not Found');
          } else {
            setError('Failed to fetch profile details');
          }
          return;
        }
        const data = await res.json();
        if (data.status === 'INACTIVE') {
          setIsInactive(true);
        } else {
          setProfile(data);
        }
      } catch (err) {
        console.error('Error fetching pet profile:', err);
        setError('An unexpected network error occurred');
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [profileId]);

  if (loading) {
    return (
      <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] py-24 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 rounded-full border-4 border-[#E30613] border-t-transparent animate-spin" />
          <p className="text-xs uppercase tracking-widest font-black text-zinc-500 animate-pulse">Loading Pet Profile...</p>
        </div>
      </main>
    );
  }

  if (error || isInactive) {
    return (
      <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] py-24 px-4 flex flex-col items-center justify-center min-h-screen">
        <div className="w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center space-y-6 shadow-xl animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
            <LucideIcon name="HeartOff" className="h-8 w-8 text-zinc-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-lg font-black uppercase tracking-tight text-white">Profile Unavailable</h1>
            <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
              {isInactive 
                ? 'This pet profile is currently unavailable.' 
                : 'We couldn\'t locate the specified pet profile. Please double check the tag or try scanning it again.'}
            </p>
          </div>
          <div className="pt-4 border-t border-zinc-900">
            <Link 
              href="/"
              className="inline-flex h-9 items-center justify-center px-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider text-white transition-colors cursor-pointer select-none"
            >
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  const phoneClean = profile.owner_phone.replace(/[+\s-]/g, '');
  const altPhoneClean = profile.alt_phone?.replace(/[+\s-]/g, '');
  const emergencyPhoneClean = profile.emergency_phone?.replace(/[+\s-]/g, '');

  const whatsappText = encodeURIComponent(`Hi FeelsNeat! 👋🐾\nI have found your pet ${profile.pet_name}. I scanned their NFC collar tag to contact you!`);
  const whatsappUrl = `https://wa.me/${phoneClean}?text=${whatsappText}`;
  const callUrl = `tel:${profile.owner_phone}`;

  return (
    <main className="flex-1 w-full bg-[#0A0A0C] text-[#F4F4F5] pb-24 flex flex-col items-center justify-start min-h-screen">
      {/* Top Banner Background */}
      <div className="w-full h-44 bg-gradient-to-b from-[#E30613]/20 via-[#0A0A0C] to-[#0A0A0C] absolute top-0 left-0 z-0 pointer-events-none" />

      <div className="w-full max-w-md px-4 pt-12 relative z-10 space-y-6">
        {/* Main Pet Image Frame */}
        <div className="w-full aspect-square rounded-3xl border border-zinc-800 overflow-hidden bg-zinc-900 shadow-2xl relative">
          {profile.pet_photo ? (
            <img 
              src={profile.pet_photo} 
              alt={profile.pet_name} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-650 bg-zinc-950">
              <LucideIcon name="Camera" className="w-12 h-12 stroke-[1.5]" />
              <span className="text-[10px] font-bold uppercase tracking-wider mt-2">No Photo Provided</span>
            </div>
          )}
          
          {/* Tag Type Badge overlay */}
          <div className="absolute top-4 right-4 bg-black/60 border border-zinc-800 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider text-white">
            🐾 {profile.pet_type}
          </div>
        </div>

        {/* Pet Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-black uppercase tracking-tight text-white flex items-center justify-center gap-2">
            {profile.pet_name}
          </h1>
          <p className="text-sm text-[#E30613] font-bold italic normal-case px-4 leading-relaxed bg-[#E30613]/5 border border-[#E30613]/10 py-3 rounded-2xl">
            &ldquo;{profile.public_message || 'If you found me, please contact my family.'}&rdquo;
          </p>
        </div>

        {/* PRIMARY CONTACT ACTIONS */}
        <div className="space-y-3 pt-2">
          {/* WhatsApp Owner Button */}
          {(profile.contact_method === 'whatsapp' || profile.contact_method === 'both') && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 inline-flex items-center justify-center gap-3 rounded-2xl bg-[#25D366] hover:bg-[#20ba56] text-sm font-black uppercase tracking-wider text-white transition-all shadow-lg active:scale-[0.98] select-none cursor-pointer"
            >
              <LucideIcon name="MessageSquare" className="h-5 w-5 fill-white stroke-none" />
              WhatsApp Family
            </a>
          )}

          {/* Call Owner Button */}
          {(profile.contact_method === 'call' || profile.contact_method === 'both') && (
            <a
              href={callUrl}
              className="w-full h-14 inline-flex items-center justify-center gap-3 rounded-2xl bg-white hover:bg-zinc-100 text-sm font-black uppercase tracking-wider text-black transition-all shadow-md active:scale-[0.98] select-none cursor-pointer"
            >
              <LucideIcon name="Phone" className="h-5 w-5 text-black" />
              Call Family
            </a>
          )}

          {/* Alternative Phone Call if owner is unreachable */}
          {profile.alt_phone && (
            <a
              href={`tel:${profile.alt_phone}`}
              className="w-full h-11 inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-xs font-black uppercase tracking-wider text-zinc-300 transition-colors select-none cursor-pointer"
            >
              <LucideIcon name="PhoneCall" className="h-4 w-4" />
              Alt Contact: {profile.alt_phone}
            </a>
          )}
        </div>

        {/* ABOUT ME GRID */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-2xl p-5 space-y-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500">About Me</h3>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-semibold uppercase">
            <div>
              <span className="text-[9px] font-bold text-zinc-500 block">Breed</span>
              <span className="text-zinc-200">{profile.pet_breed || 'Unknown'}</span>
            </div>
            <div>
              <span className="text-[9px] font-bold text-zinc-500 block">Age</span>
              <span className="text-zinc-200">{profile.pet_age || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* IMPORTANT / MEDICAL DETAILS INFORMATION */}
        {(profile.medical_info || profile.message) && (
          <div className="bg-amber-950/20 border border-amber-900/30 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-amber-500">
              <LucideIcon name="AlertTriangle" className="h-4.5 w-4.5 shrink-0" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Important Info</h3>
            </div>
            
            <div className="space-y-2 text-xs leading-relaxed text-zinc-300 normal-case font-medium">
              {profile.medical_info && (
                <p>
                  <span className="text-[9px] font-bold text-amber-500 uppercase block tracking-wider mb-0.5">Medical / Health</span>
                  {profile.medical_info}
                </p>
              )}
              {profile.message && (
                <p>
                  <span className="text-[9px] font-bold text-zinc-500 uppercase block tracking-wider mb-0.5 font-black">Approach / Temperament</span>
                  {profile.message}
                </p>
              )}
            </div>
          </div>
        )}

        {/* EMERGENCY CONTACT CARD */}
        {profile.emergency_enabled && profile.emergency_phone && (
          <div className="bg-[#E30613]/5 border border-[#E30613]/10 rounded-2xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-[#E30613]">
              <LucideIcon name="Flame" className="h-4.5 w-4.5 shrink-0" />
              <h3 className="text-[10px] font-black uppercase tracking-widest">Backup Emergency Contact</h3>
            </div>

            <div className="flex items-center justify-between">
              <div className="text-xs uppercase font-semibold">
                <span className="text-[9px] font-bold text-zinc-500 block">Contact Name</span>
                <span className="text-zinc-200">{profile.emergency_name || 'Emergency Backup'}</span>
              </div>

              <a
                href={`tel:${profile.emergency_phone}`}
                className="h-9 px-4 inline-flex items-center gap-2 rounded-xl bg-[#E30613]/15 border border-[#E30613]/30 hover:bg-[#E30613]/25 text-xs font-black uppercase tracking-wider text-[#E30613] transition-colors select-none cursor-pointer"
              >
                <LucideIcon name="Phone" className="h-3.5 w-3.5" /> Call
              </a>
            </div>
          </div>
        )}

        {/* FOOTER BRANDING */}
        <div className="text-center pt-8 border-t border-zinc-900 space-y-1.5">
          <p className="text-[9px] font-bold text-zinc-655 uppercase tracking-widest">
            Powered by <span className="text-zinc-450 font-black font-sans">FeelsNeat</span>
          </p>
          <p className="text-[8px] text-zinc-700 leading-normal normal-case px-6">
            Visual visual panels and smart NFC connections. Programmed safely for pet protection.
          </p>
        </div>
      </div>
    </main>
  );
}
