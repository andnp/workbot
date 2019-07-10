interface ScheduleOptions {
    time: string;
    repeat?: boolean;
}

export function buildScheduler(o: ScheduleOptions) {
    const opts = {
        repeat: true,
        ...o,
    };
    const schedule = (f: () => any) => {
        const now = new Date();
        const today_str = `${now.getMonth() + 1} ${now.getDate()} ${now.getFullYear()}`;

        const tmrw = new Date();
        tmrw.setDate(now.getDate() + 1);
        const tomorrow_str = `${tmrw.getMonth() + 1} ${tmrw.getDate()} ${tmrw.getFullYear()}`;

        const later_today = new Date(today_str + " " + opts.time);
        const tomorrow = new Date(tomorrow_str + " " + opts.time);

        const diff = now < later_today
            ? later_today.getTime() - now.getTime()
            : tomorrow.getTime() - now.getTime();

        console.log(diff);

        setTimeout(() => {
            f();

            if (opts.repeat) schedule(f);
        }, diff);
    };

    return schedule;
}
