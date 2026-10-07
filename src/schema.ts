import {z} from 'zod';

export const promoSchema = z.object({
	kicker: z.string(),
	kickerAr: z.string(),
	eventTitle: z.string(),
	eventTitleAr: z.string(),
	year: z.string(),
	universityName: z.string(),
	tagline: z.string(),
	musicFile: z.string(),
});

export type PromoProps = z.infer<typeof promoSchema>;

export const defaultPromoProps: PromoProps = {
	kicker: 'Unveiling the New Logo',
	kickerAr: 'تدشين الشعار الجديد',
	eventTitle: 'Quality Day',
	eventTitleAr: 'يوم الجودة',
	year: '2026',
	universityName: 'University of Technology and Applied Sciences',
	tagline: 'Quality is a Journey of Excellence',
	// Leave empty for the built-in music bed, or set a file in public/ (e.g. "music.mp3") to replace it.
	musicFile: '',
};
