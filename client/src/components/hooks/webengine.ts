import { useEffect, useState, useRef } from 'react';
import { CreateWebWorkerMLCEngine } from '@mlc-ai/web-llm';
import type { MLCEngineInterface } from '@mlc-ai/web-llm';

const SELECTED_MODEL = "Llama-3.2-3B-Instruct-q4f32_1-MLC";

export default function useWebLLM() {
    const [progress, setProgress] = useState(0);
    const [message, setMessage] = useState<string>("");
    const [engine, setEngine] = useState<MLCEngineInterface>();

    const loading = useRef(false); // ref because it's a one-shot and doesn't need reset

    // load model and update progress
    useEffect(() => {
        if (loading.current) return;
        loading.current = true;
        const initModel = async () => {
            setMessage("Initializing web model...");
            try {
                const engine = await CreateWebWorkerMLCEngine(
                    new Worker(
                        new URL("../worker.ts", import.meta.url),
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
                setEngine(engine);
            } catch (error: any) {
                console.log("Error, ", error.message);
            }
        };
        initModel();
    }, []);

    return [progress, message, engine];
}

// note to self
// useEffect runs based on whatever's in the dependency array (Second arg)
// if nothing, runs once on mount
// else runs whenevr an arg changes
// - usually used for things separate from the UI