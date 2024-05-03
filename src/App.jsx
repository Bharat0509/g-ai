import {
    PlusCircle,
    SendHorizonal,
    SendIcon,
    Share,
    Triangle,
} from "lucide-react";

import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { TooltipProvider } from "./components/ui/tooltip";
import { useEffect, useRef, useState } from "react";
import { chat, model, generationConfig, safetySettings } from "./lib/utils";

export default function App() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState([]);
    const [modelUrl, setModelUrl] = useState(null);
    const [isSuccess, setIsSuccess] = useState(false);
    const [history, setHistory] = useState([]);
    const bottomOfPanelRef = useRef(null);
    const handleChange = (e) => {
        setPrompt(e.target.value);
    };

    const chat = model.startChat({
        generationConfig,
        safetySettings,
        history: history,
    });

    const handleSubmit = async (e) => {
        setLoading(true);
        setIsSuccess(false);
        e.preventDefault();
        setHistory((history) => [
            ...history,
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ]);
        if (!modelUrl) {
            await fetch(
                `https://api.sketchfab.com/v3/search?type=models&q=${prompt}&downloadable=false&archives_flavours=false`
            )
                .then((res) => res.json())
                .then((data) => data?.results)
                .then((data) => {
                    if (data?.[0]?.embedUrl) {
                        setModelUrl(
                            `${data?.[0]?.embedUrl}?ui_infos=0&ui_watermark_link=0&ui_watermark=0`
                        );
                    }
                });
        }

        const results = await chat.sendMessage(
            `provide detailed answer for : ${prompt}.`
        );

        const res = results.response;
        setHistory((history) => [...history, res.candidates[0].content]);
        const text = res.text();

        setLoading(false);
        console.log("Adding response");
        setResponse((prev) => [...prev, { query: prompt, response: text }]);
        console.log(response);
        setPrompt("");
    };

    const handleNewTopicClick = () => {
        localStorage.setItem(`history-${Date.now()}`, history);
        setHistory([]);
        setResponse("");
        setPrompt("");
        setModelUrl(null);
    };

    return (
        <div className='grid h-screen w-full container'>
            <div className='flex flex-col'>
                <header className='sticky top-0 z-10 flex h-[53px] items-center justify-between gap-1 border-b bg-background px-4'>
                    <h1 className='text-xl font-bold flex items-center'>
                        <SendIcon />
                        Study<span className='text-blue-500'>Ground</span>.AI
                    </h1>
                    <div className='flex gap-4'>
                        <Button
                            variant='outline'
                            size='sm'
                            className='ml-auto gap-1.5 text-sm'
                        >
                            <Share className='size-3.5' /> Share
                        </Button>
                        <Button
                            variant='outline'
                            size='sm'
                            className='ml-auto gap-1.5 text-sm'
                            onClick={handleNewTopicClick}
                        >
                            <PlusCircle className='size-3.5' /> New Topic
                        </Button>
                    </div>
                </header>
                <main className='grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-5 lg:grid-cols-5'>
                    <div className='relative  flex-col items-start gap-8 md:flex sketchfab-embed-wrapper w-full h-[50vh] md:h-full bg-secondary col-span-2'>
                        {modelUrl ? (
                            <iframe
                                title='MatCap Demo: Koschey'
                                allow='autoplay; fullscreen; xr-spatial-tracking'
                                xr-spatial-tracking='true'
                                web-share='true'
                                src={modelUrl}
                                className='h-full w-full'
                            />
                        ) : (
                            <div class='w-full h-full flex items-center justify-center relative'>
                                <img
                                    src='/student.jpg'
                                    alt='Student Visualization'
                                    className='absolute h-full w-full object-cover opacity-50 '
                                />
                                <div class='text-center z-10'>
                                    <h1 class='text-3xl font-bold mb-4'>
                                        Revolutionize Your Learning Experience
                                    </h1>

                                    <p class='text-lg mb-6'>
                                        Our app simplifies complex concepts by
                                        providing interactive 3D visualizations.
                                        Just enter your topic, and instantly
                                        explore detailed models from every
                                        angle.
                                    </p>
                                    <p class='text-lg mb-6'>
                                        Whether you're unraveling the mysteries
                                        of biology, deciphering architectural
                                        wonders, or exploring any other subject,
                                        our app transforms learning into a
                                        captivating visual journey.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className='relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 col-span-1 lg:col-span-3'>
                        <div className='flex-1 overflow-scroll w-full'>
                            <div className='h-[28rem] overflow-scroll w-[75vw] md:w-full flex flex-col-reverse'>
                                {response.map((res, idx) => (
                                    <div className='border-2 p-2 rounded-md border-blue-400'>
                                        <p className='p-2 bg-slate-300'>
                                            {res.query}
                                        </p>
                                        <ReactMarkdown
                                            key={idx}
                                            children={res.response}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                        <form
                            onSubmit={handleSubmit}
                            className='relative overflow-hidden rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring'
                            x-chunk='dashboard-03-chunk-1'
                        >
                            <Label htmlFor='message' className='sr-only'>
                                Message
                            </Label>
                            <Textarea
                                id='message'
                                placeholder='Ask any question to AI...'
                                className='min-h-10 resize border-0 p-3 shadow-none focus-visible:ring-0'
                                onChange={handleChange}
                            />
                            <div className='flex items-center p-3 pt-0'>
                                <Button
                                    type='submit'
                                    size='sm'
                                    className='ml-auto gap-1.5'
                                    disabled={loading}
                                >
                                    {loading ? "Asking AI..." : "Ask AI"}
                                    <SendHorizonal className='size-3.5' />
                                </Button>
                            </div>
                        </form>
                    </div>
                </main>
            </div>
        </div>
    );
}
