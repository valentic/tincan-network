select json_agg(data) from
(
    select
        data.id,
        extract(epoch from timestamp) as timestamp,
        dwell,
        did,
        scan,
        "column",
        dnum,
        flag,
        round(r::numeric,2) as r, 
        round(az::numeric,4) as az, 
        round(el::numeric,4) as el, 
        round(rdot::numeric,2) as rdot, 
        round(upper::numeric,2) as upper, 
        round(lower::numeric,2) as lower 
    from
        radar_data as data
    where
        site_id=(select id from sites where name='{sitename}')
        and
        timestamp between to_timestamp({start_ts}) and to_timestamp({stop_ts})
    order by
        timestamp
    limit 1000000
) as data

