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

/** Home-screen settings dialog: timer duration + sound toggle (persisted). */
export function PreferencesDialog() {
  const preferences = useGameStore((state) => state.preferences);
  const setDuration = useGameStore((state) => state.setDuration);
  const toggleSound = useGameStore((state) => state.toggleSound);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="lg" className="min-h-14 gap-2">
          <Settings aria-hidden="true" />
          Preferências
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preferências</DialogTitle>
          <DialogDescription>
            Ajuste o tempo do timer e o som. Salvo neste dispositivo.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-6 py-2">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-1 text-sm font-medium">Tempo do timer</legend>
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
                    className="min-h-14 flex-1"
                  >
                    {duration}s
                  </Button>
                );
              })}
            </div>
          </fieldset>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Som</span>
            <Button
              type="button"
              variant="ghost"
              size="lg"
              aria-pressed={preferences.soundEnabled}
              aria-label={preferences.soundEnabled ? "Desativar som" : "Ativar som"}
              onClick={toggleSound}
              className="min-h-14 gap-2"
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
            <Button variant="outline" size="lg" className="min-h-14">
              Fechar
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
