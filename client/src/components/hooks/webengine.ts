import { useEffect, useState, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from '@mlc-ai/web-llm';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';

const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f32_1-MLC";

interface WebLLMState {
    progress: number;
    message: string;
    engine: MLCEngineInterface | undefined;
}

export default function useWebLLM(): WebLLMState {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState<string>("");
    const [engine, setEngine] = useState<MLCEngineInterface>();

    const loading = useRef(false);

    useEffect(() => {
        if (loading.current) return;
        loading.current = true;
        const initModel = async () => {
            setMessage("Initializing web model...");
            try {
                const loadedEngine = await CreateWebWorkerMLCEngine(
                    new Worker(
                        new URL("../../worker.ts", import.meta.url),
                    {
                        type: "module"
                    }), SELECTED_MODEL,
                    {
                        initProgressCallback: (report) => {
                            setProgress(report.progress);
                            setMessage(report.text);
                        }
                    }
                );
                setEngine(loadedEngine);
                setMessage("Model ready.");
            } catch (error: unknown) {
                const msg = error instanceof Error ? error.message : String(error);
                console.error("WebLLM init error:", msg);
                setMessage(`Error: ${msg}`);
            }
        };
        initModel();
    }, []);

    return { progress, message, engine };
}
