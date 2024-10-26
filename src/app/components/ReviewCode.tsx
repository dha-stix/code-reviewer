"use client";
import { useEffect, useState } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";

interface ViewProps {
	setToggleView: (view: "generate" | "review" | "result") => void;
	setResultContent: (result: { code: string; explanation: string; language: string }) => void;
}

export default function ReviewCode({ setToggleView, setResultContent }: ViewProps) {
	
	const [languages, setLanguages] = useState<string[]>([]);
	const [selectedLanguage, setSelectedLanguage] = useState<string>("typescript");
	const [codeSnippet, setCodeSnippet] = useState<string>("");
	const [context, setContext] = useState<string>("");
	const [disableBtn, setDisableBtn] = useState<boolean>(false);
	const monaco = useMonaco();

	useEffect(() => {
		if (monaco) {
			const availableLanguages = monaco.languages
				.getLanguages()
				.map((lang) => lang.id);
			setLanguages(availableLanguages);
		}
	}, [monaco, selectedLanguage]);

	const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		if (!selectedLanguage || !context.trim() || !codeSnippet.trim()) {
			alert("Please provide a context and code snippet to review");
			return;
		}
		postRequest();
	}
	
	const postRequest = async () => {
		setDisableBtn(true);
		const response = await fetch("/api/review", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ context, selectedLanguage, codeSnippet }),
		});
		const data = await response.json();
		if (data.data) {
			setResultContent({
				code: data.data.code,
				explanation: data.data.explanation,
				language: selectedLanguage,
			});
			setToggleView("result");
		} else {
			alert("An error occurred. Please try again");
		}
		setDisableBtn(false);
		setContext("");
		setSelectedLanguage("");
	};

	return (
		<main className='w-full min-h-[90vh] p-4 flex flex-col items-center justify-center'>
			<h2 className="text-2xl font-bold mb-3">Review Code Snippet</h2>
            <form className='w-[90%] mx-auto' onSubmit={handleSubmit}>
				<textarea
                    rows={4}
                    required
                    value={context}
                    onChange={(e) => setContext(e.target.value)}
					placeholder='Provide a context for the code you need to review'
					className='w-full border-[1px] border-gray-400 rounded px-4 py-2 mb-2'
                />
                <label htmlFor='language' className='block text-sm font-semibold text-gray-600 mb-2'>Select a programming language</label>
				<select
					className='w-full border-[1px] border-gray-400 rounded px-4 py-2 mb-5'
					value={selectedLanguage}
                    onChange={e => setSelectedLanguage(e.target.value)}
                    required
				>
					<option value=''>Select a language</option>
					{languages.map((lang) => (
						<option key={lang} value={lang}>
							{lang}
						</option>
					))}
				</select>

				<div className=' w-full mx-auto border-[1px] border-blue-400 mb-5'>
					<Editor
                        height='60vh'
                        key={selectedLanguage}
						defaultLanguage={selectedLanguage}
						theme='vs-dark'
						defaultValue='// some comment'
						onChange={(value) => setCodeSnippet(value!)}
					/>
				</div>

				<button className='w-full bg-blue-500 text-white p-4 rounded-md hover:bg-blue-700 cursor-pointer' disabled={disableBtn}>
					{disableBtn ? "Reviewing code..." : "Review Code"}
				</button>
			</form>
		</main>
	);
}