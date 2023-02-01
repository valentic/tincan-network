select json_agg(data) from
(
    select
        extract(epoch from timestamp)::integer as timestamp,
        round(r::numeric,2) as r, 
        round(az::numeric,6) as az, 
        round(el::numeric,6) as el, 
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

