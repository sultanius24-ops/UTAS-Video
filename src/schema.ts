import {z} from 'zod';

export const promoSchema = z.object({
	eventTitle: z.string(),
	eventTitleAr: z.string(),
	year: z.string(),
	universityName: z.string(),
	universityNameAr: z.string(),
	sponsorName: z.string(),
	sponsorTitle: z.string(),
	monthsOfWork: z.number().int().min(1).max(24),
	tagline: z.string(),
	musicFile: z.string(),
});

export type PromoProps = z.infer<typeof promoSchema>;

export const defaultPromoProps: PromoProps = {
	eventTitle: 'Quality Day',
	eventTitleAr: 'يوم الجودة',
	year: '2026',
	universityName: 'University of Technology and Applied Sciences',
	universityNameAr: 'جامعة التقنية والعلوم التطبيقية',
	// Replace with the patron's name and title before the ceremony.
	sponsorName: 'Our Distinguished Event Sponsor',
	sponsorTitle: 'Patron of the Ceremony',
	monthsOfWork: 2,
	tagline: 'Quality is a Journey of Excellence',
	// Drop an audio file into public/ (e.g. "music.mp3") and set its name here.
	musicFile: '',
};
