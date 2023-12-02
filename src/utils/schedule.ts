interface ScheduleOptions {
    time: string;
    repeat?: boolean;
    except?: DAYS[];
}

export function buildScheduler(o: ScheduleOptions) {
    const opts = {
        repeat: true,
        except: [] as DAYS[],
        ...o,
    };
    const schedule = (f: () => any) => {
        // if skip is set to true anywhere in this function
        // then we will skip the next schedule, but will
        // still reschedule if `repeat` is true
        let skip = false;
        const now = new Date();
        const today_str = `${now.getMonth() + 1} ${now.getDate()} ${now.getFullYear()}`;

        const tmrw = new Date();
        tmrw.setDate(now.getDate() + 1);
        const tomorrow_str = `${tmrw.getMonth() + 1} ${tmrw.getDate()} ${tmrw.getFullYear()}`;

        const later_today = new Date(today_str + " " + opts.time);
        const tomorrow = new Date(tomorrow_str + " " + opts.time);

        const next = now < later_today
            ? later_today
            : tomorrow;

        skip = opts.except.includes(next.getDay());

        const diff = next.getTime() - now.getTime();

        setTimeout(() => {
            if (!skip) f();

            if (opts.repeat) schedule(f);
        }, diff);
    };

    return schedule;
}

export const enum DAYS {
    sunday,
    monday,
    tuesday,
    wednesday,
    thursday,
    friday,
    saturday,
}
