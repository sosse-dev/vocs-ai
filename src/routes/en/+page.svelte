<script lang="ts">
	import { v4 as uuid } from 'uuid';
	import { MetaTags } from 'svelte-meta-tags';

	type Message = {
		id: string;
		text: string;
		sender: 'user' | 'ai';
		timestamp: Date;
	};

	let messages: Message[] = [];

	let inputValue = '';
	let isLoading = false;
	let messagesEnd: HTMLDivElement;
	let showChat = false;
	let showFooter = true;

	function startChatWithPrompt(prompt: string) {
		inputValue = prompt;
	}

	let expandedMessages: string[] = [];

	function toggleExpand(id: string) {
		if (expandedMessages.includes(id)) {
			expandedMessages = expandedMessages.filter((msgId) => msgId !== id);
		} else {
			expandedMessages = [...expandedMessages, id];
		}
	}

	async function sendMessage() {
		if (!inputValue.trim() || isLoading) return;
		showChat = true;

		const userMsg: Message = {
			id: uuid(),
			text: inputValue,
			sender: 'user',
			timestamp: new Date()
		};
		messages = [...messages, userMsg];
		const userInput = inputValue;
		inputValue = '';
		isLoading = true;

		const res = await fetch('/api/chat/en', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({
				messages: messages.map((m) => ({
					role: m.sender === 'user' ? 'user' : 'assistant',
					content: m.text
				}))
			})
		});

		const data = await res.json();

		const aiResponse = data.choices?.[0]?.message?.content
			? data.choices?.[0]?.message?.content
			: data.error.message.includes('Rate limit exceeded')
				? 'Rate limit exceeded'
				: 'Something went wrong.';

		const aiMsg: Message = {
			id: uuid(),
			text: aiResponse,
			sender: 'ai',
			timestamp: new Date()
		};

		messages = [...messages, aiMsg];

		// Tambahkan ke expandedMessages secara default jika panjang > 300
		if (aiMsg.text.length > 300) {
			expandedMessages = [...expandedMessages, aiMsg.id];
		}

		isLoading = false;
	}

	$: messagesEnd?.scrollIntoView({ behavior: 'smooth' });
</script>

<MetaTags
	title="VOCS AI – English Learning Assistant"
	description="VOCS is an interactive AI assistant to help you learn English. Get grammar corrections, vocabulary practice, and conversation support anytime."
	titleTemplate="%s | VOCS AI"
	openGraph={{
		title: 'VOCS AI – English ↔ Indonesian Language Assistant',
		description:
			'Learn and translate English ↔ Indonesian with AI. Practice grammar, explore new vocabulary, and enhance your language skills for all levels.',
		url: 'https://vocs.id/en', // URL ke versi Inggris
		type: 'website',
		images: []
	}}
	twitter={{
		site: '@vocs_ai',
		title: 'VOCS AI – English ↔ Indonesian Language Assistant',
		description:
			'Improve your English and Indonesian with an AI-powered assistant. Real-time feedback, grammar help, and vocabulary training.',
		image: 'https://vocs.id/og-image-en.jpg'
	}}
/>

<div class="flex flex-col h-screen bg-gray-900 text-white">
	<!-- Header -->
	<header class="p-3 border-b border-gray-800 shadow-sm">
		<div class="max-w-3xl mx-auto flex items-center justify-between">
			<div class="flex items-center gap-3">
				<div
					class="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-bold"
				>
					AI
				</div>
				<h1 class="text-lg font-bold tracking-wide">VOCS</h1>
			</div>

			<a href="/id" class="text-xs text-blue-400 hover:underline"> ID </a>
		</div>
	</header>

	<!-- Messages -->
	<main class="flex-1 overflow-y-auto px-4 pt-4 pb-36">
		<div class="max-w-3xl mx-auto space-y-4">
			{#if showChat}
				{#each messages as msg (msg.id)}
					<div class="flex flex-col mt-2 {msg.sender === 'user' ? 'items-end' : 'items-start'}">
						<!-- Bubble -->
						<div
							class="max-w-[75%] px-4 py-3 rounded-xl whitespace-pre-wrap text-sm leading-relaxed relative"
							class:bg-blue-600={msg.sender === 'user'}
							class:bg-gray-800={msg.sender !== 'user'}
							class:rounded-tr-none={msg.sender === 'user'}
							class:rounded-tl-none={msg.sender !== 'user'}
						>
							<!-- Text with show more/less -->
							{#if msg.text.length > 300}
								{#if expandedMessages.includes(msg.id)}
									{msg.text}
								{:else}
									{msg.text.slice(0, 300)}...
								{/if}
								<button
									aria-label="button"
									on:click={() => toggleExpand(msg.id)}
									class="absolute -bottom-4 right-2 bg-gray-900 rounded-full p-1 border border-gray-700 hover:bg-gray-800"
								>
									{#if expandedMessages.includes(msg.id)}
										<svg
											class="w-4 h-4 text-white"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7" />
										</svg>
									{:else}
										<svg
											class="w-4 h-4 text-white"
											fill="none"
											stroke="currentColor"
											stroke-width="2"
											viewBox="0 0 24 24"
										>
											<path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
										</svg>
									{/if}
								</button>
							{:else}
								{msg.text}
							{/if}

							<div class="text-xs text-gray-400 mt-2 text-right">
								{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
							</div>
						</div>

						<!-- Action Buttons -->
						<div class="flex gap-2 mt-2 text-xs text-blue-300">
							<button
								aria-label="button"
								on:click={() => navigator.clipboard.writeText(msg.text)}
								class="flex items-center gap-1 hover:underline"
							>
								<!-- Copy Icon -->
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2"
									/>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M16 8h2a2 2 0 012 2v8a2 2 0 01-2 2h-8a2 2 0 01-2-2v-2"
									/>
								</svg>
							</button>

							<button
								aria-label="button"
								on:click={() => (inputValue = msg.text)}
								class="flex items-center gap-1 hover:underline"
							>
								<!-- Input Icon -->
								<svg
									class="w-4 h-4"
									fill="none"
									stroke="currentColor"
									stroke-width="1.5"
									viewBox="0 0 24 24"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										d="M17 8l4 4m0 0l-4 4m4-4H7"
									/>
									<path stroke-linecap="round" stroke-linejoin="round" d="M3 4h4v16H3" />
								</svg>
							</button>
						</div>
					</div>
				{/each}

				{#if isLoading}
					<div class="flex justify-start">
						<div class="bg-gray-800 px-4 py-3 rounded-xl space-y-2 animate-pulse">
							<div class="w-32 h-3 bg-gray-600 rounded"></div>
							<div class="w-20 h-3 bg-gray-600 rounded"></div>
						</div>
					</div>
				{/if}
				<div bind:this={messagesEnd}></div>
			{:else}
				<!-- Initial Options -->
				<div class="flex flex-col items-center justify-center h-full text-center space-y-6 pt-16">
					<h2 class="text-2xl font-bold">What would you like to learn today?</h2>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-md">
						<button
							aria-label="button"
							on:click={() =>
								startChatWithPrompt("What's the difference between 'say' and 'tell'?")}
							class="border border-blue-500 text-blue-500 hover:bg-blue-500 hover:text-white transition py-3 px-4 rounded-xl"
						>
							Word Differences
						</button>
						<button
							aria-label="button"
							on:click={() => startChatWithPrompt("What does the word 'exacerbate' mean?")}
							class="border border-green-500 text-green-500 hover:bg-green-500 hover:text-white transition py-3 px-4 rounded-xl"
						>
							Word Meaning
						</button>
						<button
							aria-label="button"
							on:click={() => startChatWithPrompt('Can you help correct this sentence’s grammar?')}
							class="border border-purple-500 text-purple-500 hover:bg-purple-500 hover:text-white transition py-3 px-4 rounded-xl"
						>
							Grammar Fix
						</button>
						<button
							aria-label="button"
							on:click={() =>
								startChatWithPrompt('Give me a vocabulary exercise for intermediate level.')}
							class="border border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black transition py-3 px-4 rounded-xl"
						>
							Vocabulary Exercise
						</button>
					</div>
				</div>
			{/if}
		</div>
	</main>

	<!-- Floating Input -->
	<form
		on:submit|preventDefault={sendMessage}
		class="w-full border-t border-gray-800 bg-gray-950 p-4 md:border-0 md:bg-transparent md:fixed md:bottom-20 lg:bottom-14 md:left-1/2 md:-translate-x-1/2 md:w-full md:max-w-2xl md:px-0"
	>
		<div
			class="flex gap-2 bg-gray-950 rounded-xl p-3 border border-gray-800 items-center relative md:shadow-2xl md:shadow-blue-600/30"
		>
			<!-- File Button -->
			<div class="relative group">
				<button
					aria-label="button"
					type="button"
					class="p-2 rounded-lg hover:bg-gray-800 text-gray-400"
				>
					<svg
						class="w-5 h-5"
						fill="none"
						stroke="currentColor"
						stroke-width="1.5"
						viewBox="0 0 24 24"
					>
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							d="M12 4v4a1 1 0 001 1h4M16 20H8a2 2 0 01-2-2V6a2 2 0 012-2h4l4 4v12a2 2 0 01-2 2z"
						/>
					</svg>
				</button>
				<!-- Tooltip -->
				<div
					class="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition"
				>
					Not available yet
				</div>
			</div>

			<!-- Input Field -->
			<input
				type="text"
				bind:value={inputValue}
				placeholder="Type your message..."
				class="flex-1 px-4 py-2 rounded-lg bg-gray-800 text-white focus:outline-none"
			/>

			<!-- Send Button -->
			<button
				aria-label="button"
				type="submit"
				class="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white disabled:opacity-50"
				disabled={!inputValue.trim() || isLoading}
			>
				<svg class="w-5 h-5" fill="none" stroke="white" stroke-width="1.5" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" d="M3 10l19-7-7 19-2.5-7.5L3 10z" />
				</svg>
			</button>
		</div>
	</form>

	<!-- Footer -->
	{#if showFooter}
		<p
			class="text-center text-xs text-gray-500 pt-1 pb-2 mt-2 md:mt-3 md:mb-4 md:fixed md:bottom-2 md:left-1/2 md:-translate-x-1/2"
		>
			Powered by <span class="font-semibold text-gray-300">DeepSeek V3</span> via
			<span class="font-semibold text-gray-300">OpenRouter</span>. Messages are
			<span class="italic">not stored</span>. This AI may occasionally produce
			<span class="text-yellow-400 font-medium">inaccurate information</span>, so please verify
			facts when needed.
			<button
				on:click={() => (showFooter = false)}
				class="ml-2 text-blue-400 underline hover:text-blue-300 text-[11px]"
			>
				Hide
			</button>
		</p>
	{/if}
</div>
