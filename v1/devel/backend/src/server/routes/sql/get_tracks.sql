select json_agg(data) from
(
    select
        data.id,
        extract(epoch from timestamp) as timestamp,
        track_id,
        target_id,
        round(x::numeric,2) as x, 
        round(y::numeric,2) as y, 
        round(z::numeric,2) as z, 
        round(xdot::numeric,2) as xdot, 
        round(ydot::numeric,2) as ydot, 
        round(zdot::numeric,2) as zdot 
    from
        track_data as data
    where
        site_id=(select id from sites where name='{sitename}')
        and
        timestamp between to_timestamp({start_ts}) and to_timestamp({stop_ts})
    order by
        timestamp
) as data
