export class CompletionAudio {
  private context: AudioContext | null = null;
  private heard = new Set<string>();
  async unlock(): Promise<boolean> {
    try {
      this.context ??= new AudioContext();
      await this.context.resume();
      return this.context.state === "running";
    } catch {
      return false;
    }
  }
  play(eventId: string, enabled: boolean): void {
    if (this.heard.has(eventId)) return;
    this.heard.add(eventId);
    if (this.heard.size > 100)
      this.heard.delete(this.heard.values().next().value!);
    if (!enabled || !this.context || this.context.state !== "running") return;
    const oscillator = this.context.createOscillator(),
      gain = this.context.createGain(),
      now = this.context.currentTime;
    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(660, now);
    oscillator.frequency.exponentialRampToValueAtTime(880, now + 0.1);
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.035, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.24);
  }
}
