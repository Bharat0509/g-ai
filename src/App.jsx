import { SendHorizonal, Share, Triangle } from "lucide-react";

import { Button } from "./components/ui/button";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import ReactMarkdown from "react-markdown";
import { TooltipProvider } from "./components/ui/tooltip";
import { useState } from "react";
import { chat } from "./lib/utils";

export default function App() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [response, setResponse] = useState("");
    const [modelUrl, setModelUrl] = useState();
    const [isSuccess, setIsSuccess] = useState(false);
    const handleChange = (e) => {
        setPrompt(e.target.value);
    };
    console.log(process.env.REACT_APP_API_KEY);
    const handleSubmit = async (e) => {
        setLoading(true);
        setIsSuccess(false);
        e.preventDefault();

        const data = await fetch(
            `https://api.sketchfab.com/v3/search?type=models&q=${prompt}&downloadable=false&archives_flavours=false`
        )
            .then((res) => res.json())
            .then((data) => data.results)
            .then((data) => {
                setModelUrl(
                    `${data[0]?.embedUrl}?ui_infos=0&ui_watermark_link=0&ui_watermark=0`
                );
            });
        const results = await chat.sendMessage(
            `
                provide details for ${prompt}.dont use too much '\n'.
            `
        );
        console.log(process.env.REACT_API_KEY);
        const response = results.response;
        const text = response.text();
        console.log(text);
        setLoading(false);
        setResponse(text);
    };
    return (
        <TooltipProvider>
            <div className='grid h-screen w-full container'>
                <div className='flex flex-col'>
                    <header className='sticky top-0 z-10 flex h-[53px] items-center gap-1 border-b bg-background px-4'>
                        <h1 className='text-xl font-semibold'>Playground</h1>
                        <Button
                            variant='outline'
                            size='sm'
                            className='ml-auto gap-1.5 text-sm'
                        >
                            <Share className='size-3.5' /> Share
                        </Button>
                    </header>
                    <main className='grid flex-1 gap-4 overflow-auto p-4 md:grid-cols-2 lg:grid-cols-3'>
                        <div className='relative  flex-col items-start gap-8 md:flex sketchfab-embed-wrapper w-full h-[50vh] md:h-full bg-secondary'>
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
                                <>
                                    <div class='w-full h-full flex items-center justify-center'>
                                        <div class='text-center'>
                                            <h1 class='text-3xl font-bold mb-4'>
                                                Discover Immersive 3D Models
                                            </h1>
                                            <p class='text-lg mb-6'>
                                                Explore a variety of objects,
                                                creatures, and environments in
                                                stunning 3D.
                                            </p>
                                            <p class='text-lg mb-6'>
                                                Simply provide a query, and our
                                                AI will generate detailed
                                                information along with a
                                                Sketchfab model embed URL,
                                                allowing you to visualize it in
                                                3D.
                                            </p>
                                            <p class='text-lg mb-6'>
                                                Whether you're studying biology,
                                                architecture, or simply curious
                                                about the world around you, our
                                                app provides a unique way to
                                                interact with 3D content.
                                            </p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                        <div className='relative flex h-full min-h-[50vh] flex-col rounded-xl bg-muted/50 p-4 lg:col-span-2'>
                            <div className='flex-1 overflow-scroll h-[70vh]'>
                                <pre className='h-80 max-w-lg flex-wrap my-4'>
                                    <ReactMarkdown children={response} />
                                </pre>
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
        </TooltipProvider>
    );
}
