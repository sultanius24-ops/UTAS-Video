import {z} from 'zod';

export const promoSchema = z.object({
	kicker: z.string(),
	kickerAr: z.string(),
	eventTitle: z.string(),
	eventTitleAr: z.string(),
	year: z.string(),
	universityName: z.string(),
	tagline: z.string(),
	taglineAr: z.string(),
	introLine: z.string(),
	introLineAr: z.string(),
	standbyNote: z.string(),
	standbyNoteAr: z.string(),
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
	tagline: "Quality is Everyone's Responsibility",
	taglineAr: 'الجودة مسؤولية الجميع',
	introLine: '60 days · countless contributions',
	introLineAr: '٦٠ يومًا من العمل… وإسهامات لا تُحصى',
	standbyNote: 'The ceremony will begin shortly',
	standbyNoteAr: 'يبدأ الحفل بعد قليل',
	// Leave empty for the built-in music bed, or set a file in public/ (e.g. "music.mp3") to replace it.
	musicFile: '',
};
