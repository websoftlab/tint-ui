export type InputSize = "md" | "lg" | "sm" | "xs";

export type InputChangeProps = {
	onFormatValue?: (value: string) => string;
	onChangeValue?: (value: string) => void;
	onChangeOptions?: Partial<{
		validate: boolean;
		dirty: boolean;
		touch: boolean;
		clearError: boolean;
	}>;
};

export type InputChangeNumberProps = {
	min?: number;
	max?: number;
	step?: number;
	ctrlStep?: number;
	onFormatValue?: (value: number) => number;
	onChangeValue?: (value: number | null) => void;
	onChangeOptions?: Partial<{
		validate: boolean;
		dirty: boolean;
		touch: boolean;
		clearError: boolean;
	}>;
};
