import {
	Component,
	createContext,
	createSignal,
	For,
	JSXElement,
	onCleanup,
	onMount,
	Show,
} from 'solid-js';
import { createStore, reconcile } from 'solid-js/store';
import PanelContainer from './PanelContainer';

interface PanelState {
	id: string;
	size: number; // percentage or pixels
}

const PanelManager: Component = () => {
	const [panels, setPanels] = createStore<PanelState[]>([
		{ id: '1', size: 50 },
		{ id: '2', size: 50 },
	]);
	const [isResizing, setIsResizing] = createSignal<number | null>(null);
	const [resizeStartX, setResizeStartX] = createSignal(0);
	const [resizeStartSizes, setResizeStartSizes] = createSignal<number[]>([]);
	let containerRef: HTMLDivElement | undefined;

	const addPanel = () => {
		const newId = String(panels.length + 1);
		const equalSize = 100 / (panels.length + 1);

		// Adjust all panels to equal size and add new panel
		setPanels(
			reconcile([
				...panels.map((p) => ({ ...p, size: equalSize })),
				{ id: newId, size: equalSize },
			])
		);
	};

	const removePanel = (id: string) => {
		if (panels.length <= 1) return; // Keep at least one panel

		const filtered = panels.filter((p) => p.id !== id);
		const equalSize = 100 / filtered.length;

		// Redistribute sizes equally
		setPanels(filtered.map((p) => ({ ...p, size: equalSize })));
	};

	const handleResizeStart = (index: number, e: MouseEvent) => {
		e.preventDefault();
		setIsResizing(index);
		setResizeStartX(e.clientX);
		setResizeStartSizes(panels.map((p) => p.size));
		document.body.style.cursor = 'col-resize';
		document.body.style.userSelect = 'none';
	};

	const handleResizeMove = (e: MouseEvent) => {
		const resizingIndex = isResizing();
		if (resizingIndex === null) return;

		const startSizes = resizeStartSizes();
		const deltaX = e.clientX - resizeStartX();
		const containerWidth = containerRef?.clientWidth || window.innerWidth;
		const deltaPercent = (deltaX / containerWidth) * 100;

		const leftPanel = panels[resizingIndex];
		const rightPanel = panels[resizingIndex + 1];

		if (!leftPanel || !rightPanel) return;

		const newLeftSize = Math.max(
			10,
			Math.min(90, startSizes[resizingIndex] + deltaPercent)
		);
		const newRightSize = Math.max(
			10,
			Math.min(90, startSizes[resizingIndex + 1] - deltaPercent)
		);

		setPanels(resizingIndex, 'size', newLeftSize);
		setPanels(resizingIndex + 1, 'size', newRightSize);
	};

	const handleResizeEnd = () => {
		setIsResizing(null);
		document.body.style.cursor = '';
		document.body.style.userSelect = '';
	};

	onMount(() => {
		window.addEventListener('mousemove', handleResizeMove);
		window.addEventListener('mouseup', handleResizeEnd);
	});

	onCleanup(() => {
		window.removeEventListener('mousemove', handleResizeMove);
		window.removeEventListener('mouseup', handleResizeEnd);
	});

	return (
		<div class="h-screen w-screen flex flex-col bg-gray-50">
			{/* Toolbar */}
			<div class="flex items-center gap-2 p-2 bg-gray-200 border-b border-gray-300">
				<button
					onClick={addPanel}
					class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
				>
					Add Panel
				</button>
				<div class="text-sm text-gray-600">
					{panels.length} panel{panels.length !== 1 ? 's' : ''}
				</div>
			</div>

			{/* Panels Container */}
			<div ref={containerRef} class="flex-1 flex overflow-hidden">
				<For each={panels}>
					{(panel, index) => (
						<>
							<div
								class="relative overflow-hidden border-r border-gray-300"
								style={{ width: `${panel.size}%` }}
							>
								{/* Panel Header */}
								<div class="flex items-center justify-between bg-gray-100 border-b border-gray-300 px-2 py-1">
									<span class="text-sm font-medium text-gray-700">
										Panel {index() + 1}
									</span>
									<Show when={panels.length > 1}>
										<button
											onClick={() => removePanel(panel.id)}
											class="text-red-500 hover:text-red-700 text-sm px-2 py-0.5 rounded hover:bg-red-50 transition-colors"
										>
											×
										</button>
									</Show>
								</div>

								{/* Panel Content */}
								<div class="h-[calc(100%-32px)]">
									<PanelContainer id={panel.id} />
								</div>
							</div>

							{/* Resize Handle */}
							<Show when={index() < panels.length - 1}>
								<div
									class="w-1 bg-gray-300 hover:bg-blue-500 cursor-col-resize transition-colors relative group"
									onMouseDown={(e) => handleResizeStart(index(), e)}
								>
									<div class="absolute inset-y-0 -left-1 -right-1" />
									<div class="absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
								</div>
							</Show>
						</>
					)}
				</For>
			</div>
		</div>
	);
};

export default PanelManager;
