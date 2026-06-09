"use client";

import { Settings, Volume2, VolumeX } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { TIMER_DURATIONS } from "@/lib/game";
import { useGameStore } from "@/lib/store/game-store";
import { cn } from "@/lib/utils";

/** Home-screen settings dialog: timer duration + sound toggle (persisted). */
export function PreferencesDialog() {
  const preferences = useGameStore((state) => state.preferences);
  const setDuration = useGameStore((state) => state.setDuration);
  const toggleSound = useGameStore((state) => state.toggleSound);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon-lg"
          aria-label="Preferências"
          className="rounded-full text-white hover:bg-white/15 hover:text-white"
        >
          <Settings className="size-6" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-heading text-2xl">Preferências</DialogTitle>
          <DialogDescription>
            Ajuste o tempo do timer e o som. Salvo neste dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-2 text-sm font-semibold">Tempo do timer</legend>
            <div className="flex flex-wrap gap-2">
              {TIMER_DURATIONS.map((duration) => {
                const selected = preferences.duration === duration;
                return (
                  <Button
                    key={duration}
                    type="button"
                    variant={selected ? "default" : "outline"}
                    aria-pressed={selected}
                    onClick={() => setDuration(duration)}
                    className={cn(
                      "min-h-14 flex-1 rounded-xl text-base font-semibold",
                      selected && "ring-party-amber ring-2",
                    )}
                  >
                    {duration}s
                  </Button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Som</span>
            <Button
              type="button"
              variant="outline"
              size="lg"
              aria-pressed={preferences.soundEnabled}
              aria-label={preferences.soundEnabled ? "Desativar som" : "Ativar som"}
              onClick={toggleSound}
              className="min-h-14 gap-2 rounded-xl"
            >
              {preferences.soundEnabled ? (
                <Volume2 aria-hidden="true" />
              ) : (
                <VolumeX aria-hidden="true" />
              )}
              {preferences.soundEnabled ? "Ligado" : "Desligado"}
            </Button>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button size="lg" className="min-h-14 rounded-xl font-semibold">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
