// Brand palette sampled from the new Quality Day logo.
export const colors = {
	night: '#030C2B',
	navy: '#061A4D',
	deep: '#0A2A8A',
	royal: '#1557D6',
	sky: '#3D8BFF',
	ice: '#BFD8FF',
	orange: '#F7841E',
	amber: '#FFC233',
	white: '#FFFFFF',
	ink: '#0B1533',
	paper: '#F6F9FF',
};

export const gradients = {
	blue: `linear-gradient(180deg, ${colors.sky} 0%, ${colors.royal} 45%, ${colors.deep} 100%)`,
	orange: `linear-gradient(180deg, ${colors.amber} 0%, ${colors.orange} 60%, #E2531A 100%)`,
	orangeText: `linear-gradient(90deg, ${colors.amber} 0%, ${colors.orange} 100%)`,
	blueText: `linear-gradient(90deg, ${colors.sky} 0%, ${colors.royal} 100%)`,
};

export const fonts = {
	display: '"Montserrat", "Cairo", sans-serif',
	arabic: '"Cairo", "Montserrat", sans-serif',
};
