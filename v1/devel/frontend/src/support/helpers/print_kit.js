/********************************************************************\
 *  Utility functions for formatted printing
 *
 *  For degree symbol, see:
 *      https://www.alt-codes.net/degree_sign_alt_code.php
 *
 *  2020-06-23  Todd Valentic
 *              Initial implementation
 *
 *  2020-08-25  Todd Valentic
 *              Add additional functions from hbrops
 *              
 *  2022-08-03  Todd Valentic
 *              Add check in fromnow() to convert jsdate to moment
 *              
 *  2022-08-16  Todd Valentic
 *              Use &nbsp (\u00A0)
 *
\********************************************************************/

import moment from 'moment-timezone'

const zpad = (value,width) => {
    const fill = "000000000"
    const result = fill+value
    return result.slice(-width)
}

const pad = (value,width) => {
    const fill = "       "
    const result = fill+value
    return result.slice(-width)
}

const not_set = (value) => {
    return (typeof value==='undefined' || value === null || Number.isNaN(value))
}

const capitalize = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const as_hex = (value,width) => {
    if (not_set(value))
        return '--'

    return '0x'+zpad(Math.abs(parseInt(value,10)).toString(16),8)
}

const as_string = (value) => {
    if (not_set(value))
        return '--'
    return value
}

const as_num = (value,units,decimals) => {
    if (not_set(value))
        return '--'
    return value.toFixed(decimals)+units
}

const as_temp = (value,decimals) => {
    return as_num(value,'\u00B0C',decimals)
}

const as_temp_c = (value,decimals) => {
    return as_temp(value,decimals)
}

const as_temp_f = (value,decimals) => {
    return as_num(value,'\u00B0F',decimals)
}

const as_knots = (value,decimals) => {
    return as_num(value,' kn',decimals)
}

const as_degs = (value,decimals) => {
    return as_num(value,'\u00B0',decimals)
}

const as_m = (value,decimals) => {
    return as_num(value,'\u00A0m',decimals)
}

const as_mb = (value,decimals) => {
    return as_num(value,'\u00A0mb',decimals)
}

const as_inhg = (value) => {
    return as_num(value,'\u00A0in\u00A0Hg',2)
}

const as_ft = (value,decimals) => {
    return as_num(value,'\u00A0ft',decimals)
}

const as_mps = (value,decimals) => {
    return as_num(value,'\u00A0m/s',decimals)
}

const as_percent = (value,decimals) => {
    return as_num(value,'%',decimals)
}

const as_voltage = (value,decimals) => {
    return as_num(value,'\u00A0V',decimals)
}

const as_voltage_mv = (value,decimals) => {
    return as_num(value*1000,'\u00A0mV',decimals)
}
const as_current = (value,decimals) => {
    return as_num(value,'\u00A0A',decimals)
}

const as_current_ma = (value,decimals) => {
    return as_num(value*1000,'\u00A0mA',decimals)
}

const as_power = (value,decimals) => {
    return as_num(value,'\u00A0W',decimals)
}

const as_power_mw = (value,decimals) => {
    return as_num(value,'\u00A0mW',decimals)
}

const as_flag = (value) => {
    if (not_set(value))
        return '--'

    if (value) {
        return 'On'
    } else {
        return 'Off'
    }
}

const as_compass = (value) => {

    const labels = [
        'N','NNE','NE','ENE',
        'E','ESE','SE','SSE',
        'S','SSW','SW','WSW',
        'W','WNW','NW','NNW','N']

    if (not_set(value))
        return '--'

    const sector = Math.round((value % 360)/22.5)

    return labels[sector]
}

const as_degs_compass = (value,decimals) => {
    if (not_set(value))
        return '--'

    return as_degs(value,decimals)+'\u00A0'+as_compass(value)
}

const as_moment = (value, format='YYYY-MM-DD HH:mm:ss') => {
    if (not_set(value))
        return '--'

    const tm = moment.utc(value)

    //return value.replace('T',' ').replace('+00:00',' UTC')
    
    return tm.format(format)
}

const as_datetime = (value) => {
    const ts = new Date(value*1000)
    return ts.toISOString()
}

const as_fromnow = (tm) => {
    if (not_set(tm))
        return '--'

    if (moment.isMoment(tm)) {
        return tm.fromNow()
    } 

    return moment(tm).fromNow() 
}

const as_duration = (duration) => {
    const s = Math.floor( (duration/1000) % 60)
    const m = Math.floor( (duration/1000/60) % 60)
    const h = Math.floor( (duration/(1000*60*60)) % 24)
    const d = Math.floor(  duration/(1000*60*60*24) )

    let result = ''

    if (d>1) {
        result += d + '\u00A0days\u00A0 '
    } else if (d>0) {
        result += d + '\u00A0day\u00A0'
    }

    result += zpad(h,2)+':'+zpad(m,2)+':'+zpad(s,2)
    //result += zpad(h,2)+':'+zpad(m,2)

    return result
}

const as_coord_deg = (coordinate,posLabel,negLabel) => {

    if (not_set(coordinate))
        return '--'

    let absolute = Math.abs(coordinate);
    let degrees = Math.floor(absolute);
    let minutesNotTruncated = (absolute - degrees) * 60;
    let minutes = Math.floor(minutesNotTruncated);
    let seconds = Math.floor((minutesNotTruncated - minutes) * 60);
    let label = Math.sign(coordinate) >= 0 ? posLabel : negLabel

    degrees =  pad(degrees,3)
    minutes = zpad(minutes,2)
    seconds = zpad(seconds,2)

    return degrees + "\u00B0\u00A0" + minutes + "\u2032\u00A0" + seconds + "\u2033\u00A0" + label;
}

const as_latitude_deg = (lat) => {
    return as_coord_deg(lat,'N','S')
}

const as_longitude_deg = (lon) => {
    return as_coord_deg(lon,'E','W')
}

const as_latitude_dec = (lat) => {
    return as_num(lat,'',5)
}

const as_longitude_dec = (lon) => {
    return as_num(lon,'',5)
}

const print = {
    zpad,
    pad,
    not_set,
    capitalize,
    as_hex,
    as_string,
    as_num,
    as_temp,
    as_temp_c,
    as_temp_f,
    as_knots,
    as_degs,
    as_m,
    as_mb,
    as_inhg,
    as_ft,
    as_mps,
    as_percent,
    as_voltage,
    as_voltage_mv,
    as_current,
    as_current_ma ,
    as_power,
    as_power_mw,
    as_flag,
    as_compass,
    as_degs_compass,
    as_moment,
    as_datetime,
    as_fromnow,
    as_duration,
    as_coord_deg,
    as_latitude_deg,
    as_longitude_deg,
    as_latitude_dec,
    as_longitude_dec
}

export { print }
