description = [[
After the user has defined the target service which shall be fingerprinted, a common tcp
connection is opened to the destination port. If the connection could
be established, the http requests are sent to the target service. This
one will shall react with responses. These could be dissected to
identify some specific fingerprint elements. Those elements are looked
up in the local fingerprint database. If there is a match, the
according implementation is flagged as "identified". All these flags
were counted so serverspy is able to determine which implementation has
the best match rate.
]]

categories = {"default", "safe"}

local shortport	= require "shortport"
local tab	= require "tab"
local http	= require "http"
local stdnse	= require "stdnse"

result = {}	-- Global result data

portrule = shortport.port_or_service({80, 443}, {"http", "https"}, {"tcp"})

action = function(host, port)
	local response		-- Response from the server

	local maxresults = 1000	-- Top listing of matches; change to what you like
	if nmap.registry.args.serverspytoplist then
		maxresults = tonumber(nmap.registry.args.serverspytoplist)
	end

	-- Collect http responses
	if nmap.registry.args.serverspytestgetexisting ~= "0" then
		response = send_http_request(host, port, "GET", "/")
		if type(response) == "table" then
			identify_fingerprint(response, "scripts/serverspy/get_existing/")
			save_response("scripts/serverspy/get_existing.txt", response)
		else
			stdnse.print_debug(1, "serverspy: Failed to do get_existing analysis")
			save_response("scripts/serverspy/get_existing.txt", "Failed to fetch response")
		end
	end

	if nmap.registry.args.serverspytestgetnonexisting ~= "0" then
		response = send_http_request(host, port, "GET", "/404test_.html")
		if type(response) == "table" then
			identify_fingerprint(response, "scripts/serverspy/get_nonexisting/")
			save_response("scripts/serverspy/get_nonexisting.txt", response)
		else
			stdnse.print_debug(1, "serverspy: Failed to do get_nonexisting analysis")
			save_response("scripts/serverspy/get_nonexisting.txt", "Failed to fetch response")
		end
	end

	if nmap.registry.args.serverspytestgetlong ~= "0" then
		response = send_http_request(host, port, "GET", "/" .. string.rep("a", 1024))
		if type(response) == "table" then
			identify_fingerprint(response, "scripts/serverspy/get_long/")
			save_response("scripts/serverspy/get_long.txt",response)
		else
			stdnse.print_debug(1, "serverspy: Failed to do get_long analysis")
			save_response("scripts/serverspy/get_long.txt","Failed to fetch response")
		end
	end

	if nmap.registry.args.serverspytestheadexisting ~= "0" then
		response = send_http_request(host, port, "HEAD", "/")
		if type(response) == "table" then
			identify_fingerprint(response, "scripts/serverspy/head_existing/")
			save_response("scripts/serverspy/head_existing.txt", response)
		else
			stdnse.print_debug(1, "serverspy: Failed to do head_existing analysis")
			save_response("scripts/serverspy/head_existing.txt", "Failed to fetch response")
		end
	end	
	
	-- Generate output
	if type(result) == "table" then
		stdnse.print_debug(1, "serverspy: %d matches found", #result)

		if #result > 0 then
			for i = 1, #result, 1 do
				for j = 2, #result do
					if result[j].score > result[j-1].score then
						temp = result[j-1]
						result[j-1] = result[j]
						result[j] = temp
					end
				end
			end

			local t = tab.new(4)
			tab.addrow(t, "Server and version", "Score", "Elements matched")
			for i=1, #result, 1 do
				tab.addrow(t,
					tostring(i),
					result[i].matchname,
					tostring(result[i].score),
					tostring(result[i].count)
				)

				if i == maxresults then
					stdnse.print_debug(1, "serverspy: %d top matches displaying", i)
					break
				end
			end
			return tab.dump(t)
		end
	else
		stdnse.print_debug(1, "serverspy: Failed to do whole analysis")
	end
end

function save_response(filename, response)
    local file = io.open(filename, "w")
    if file then
        if type(response) == "table" then
            -- Extract raw HTTP response if available
            local http_data = response.rawheader or response.body or "No response data"
            file:write(http_data)
        else
            file:write(tostring(response))
        end
        file:close()
        stdnse.print_debug(1, "serverspy: Response saved at " .. filename)
    else
        stdnse.print_debug(1, "serverspy: Failed to write file at " .. filename)
    end
end




function send_http_request(host, port, method, resource)
	local res	-- Response from the web server

	if method == "HEAD" then
		stdnse.print_debug(2, "serverspy: Sending head request")
		res = http.head(host, port, resource)
    	elseif method == "DELETE" then
        	stdnse.print_debug(2, "serverspy: Sending delete request")
		res = http.generic_request(host, port, "DELETE", resource) 
	elseif method == "OPTIONS" then
        	stdnse.print_debug(2, "serverspy: Sending options request")
		res = http.generic_request(host, port, "OPTIONS", resource) 
	elseif method == "TEST" then
        	stdnse.print_debug(2, "serverspy: Sending test request")
		res = http.generic_request(host, port, "TEST", resource) 
	
	else
		stdnse.print_debug(2, "serverspy: Sending get request")
		res = http.get(host, port, resource)
	end

	if type(res) == "table" then
		stdnse.print_debug(2, "serverspy: Received response")

		for i=1, #res.rawheader, 1 do
			stdnse.print_debug(3, "serverspy: \t%s", res.rawheader[i])
		end

		return res
	else
		stdnse.print_debug(1, "serverspy: Failed to receive response for %s", method .. " " .. resource)
		return ""
	end
end

function identify_fingerprint(response, database)
	stdnse.print_debug(2, "serverspy: Identifying fingerprint in %s", database)

	find_match_in_db(database .. "accept-range.fdb",		get_header_value(get_header_line(response.rawheader, "Accept-Ranges", false)), 1)
	find_match_in_db(database .. "banner.fdb",			get_header_value(get_header_line(response.rawheader, "Server", false)), 30)
	find_match_in_db(database .. "cache-control.fdb",		get_header_value(get_header_line(response.rawheader, "Cache-Control", false)), 2)
	find_match_in_db(database .. "connection.fdb",			get_header_value(get_header_line(response.rawheader, "Connection", false)), 2)
	find_match_in_db(database .. "content-type.fdb",		get_header_value(get_header_line(response.rawheader, "Content-Type", false)), 1)
	find_match_in_db(database .. "etag-length.fdb",			string.format("%s", string.len(get_header_value(get_header_line(response.rawheader, "ETag", false)))), 5)
	find_match_in_db(database .. "etag-quotes.fdb",			get_quotes(get_header_value(get_header_line(response.rawheader, "ETag", false))), 2)
	find_match_in_db(database .. "header-capitalafterdash.fdb",	string.format("%s", capital_after_dash(analyze_header_order(response.rawheader))), 2)
	find_match_in_db(database .. "header-order.fdb",		analyze_header_order(response.rawheader), 8)
	find_match_in_db(database .. "header-space.fdb",		string.format("%s", header_space(response.rawheader)), 2)
	find_match_in_db(database .. "htaccess-realm.fdb",		get_realm(get_header_line(response.rawheader, "WWW-Authenticate", false)), 3)
	find_match_in_db(database .. "pragma.fdb",			get_header_value(get_header_line(response.rawheader, "Pragma", false)), 2)
	find_match_in_db(database .. "protocol-name.fdb",		get_protocol_name(response['status-line']), 1)
	find_match_in_db(database .. "protocol-version.fdb",		get_protocol_version(response['status-line']), 2)
	find_match_in_db(database .. "statuscode.fdb",			get_status_code(response.status), 5)
	find_match_in_db(database .. "statustext.fdb",			get_status_text(response['status-line']), 5)
	find_match_in_db(database .. "vary-capitalize.fdb",		string.format("%s", has_capital(get_header_line(response.rawheader, "Vary", false))), 2)
	find_match_in_db(database .. "vary-delimiter.fdb",		vary_delimiter(get_header_line(response.rawheader, "Vary", false)), 2)
	find_match_in_db(database .. "vary-order.fdb",			get_header_value(get_header_line(response.rawheader, "Vary", false)), 3)
	find_match_in_db(database .. "x-powered-by.fdb",		get_header_value(get_header_line(response.rawheader, "X-Powered-By", false)), 2)
	--find_match_in_db(database .. "options-allowed.fdb",		get_header_value(get_header_line(response.rawheader, "Options", false)), 3)
	--find_match_in_db(database .. "options-delimited.fdb",		get_header_value(get_header_line(response.rawheader, "Options", false)), 3)
	--find_match_in_db(database .. "options-public.fdb",		get_header_value(get_header_line(response.rawheader, "Options", false)), 3)


end

function find_match_in_db(databasefile, fingerprint, basescore)
	local database		= read_from_file(databasefile)	-- Content of fingerprint database
	local delimiterpos					-- Position of delimiter
	local name						-- Name of implementation
	local pattern						-- Pattern of fingerprint
	local arraypos						-- Position in array

	stdnse.print_debug(3, "serverspy: Looking for matches of %s", fingerprint)
	for i=1, #database, 1 do
		database[i] = string.gsub(database[i], "%s", "")
	
		delimiterpos = string.find(database[i], ";")

		if type(delimiterpos) == "number" then
			stdnse.print_debug(4, "serverspy: Find delimiter at position %d", delimiterpos)
			name = string.sub(database[i], 1, delimiterpos - 1)
			pattern = string.sub(database[i], delimiterpos + 1)

			if type(pattern) == "string" and pattern ~= "" and type(name) == "string" and name ~= "" then
				stdnse.print_debug(4, "serverspy: Looking for pattern %s", pattern)
				if fingerprint == pattern then
					arraypos = in_array(result, name)

					stdnse.print_debug(3, "serverspy: Find match for %s", name)
					if type(arraypos) == "number" then
						result[arraypos] = {
							matchname = name,
							count = result[arraypos].count + 1,
							score = result[arraypos].score + basescore
							}
					else
						result[#result + 1] = {
							matchname = name,
							count = 1,
							score = basescore
							}
					end
				end
			end
		end
	end

	return true
end

--
-- HTTP Data Dissection
--

function get_protocol_name(statusline)
	if type(statusline) == "string" then
		if string.len(statusline) > 4 then
			return trim(string.sub(statusline, 1, 4))
		end
	end
end

function get_protocol_version(statusline)
	if type(statusline) == "string" then
		if string.len(statusline) > 8 then
			return trim(string.sub(statusline, 6, 8))
		end
	end
end

function get_status_text(statusline)
	if type(statusline) == "string" then
		if string.len(statusline) > 14 then
			return trim(string.sub(statusline, 14))
		end
	end
end

function get_status_code(status)
	if type(status) == "number" then
		return string.format("%s", status)
	end
end

function get_header_line(rawheader, line, casesensitive)
	local headerline	-- Line of header

	if type(rawheader) == "table" then
		for i=1, #rawheader, 1 do
			headerline = string.sub(rawheader[i], 1, string.len(line) + 2)

			if headerline ~= nil and headerline ~= "" then
				if casesensitive == true and string.find(headerline, line .. ": ", 1, true) ~= nil then
					stdnse.print_debug(3, "serverspy: Get header line %s (with case-sensitive)", rawheader[i])
					return rawheader[i]
				elseif casesensitive == false and string.find(string.lower(headerline), string.lower(line) .. ": ", 1, true) ~= nil then
					stdnse.print_debug(3, "serverspy: Get header line %s", rawheader[i])
					return rawheader[i]
				end
			end
		end
	end

	return ""
end

function get_header_value(headerline)
	local headervalue = ""					-- Value of headerline
	local delimiterpos = string.find(headerline, ":")	-- Delimiter position of header

	if type(delimiterpos) == "number" then
		headervalue = trim(string.sub(headerline, delimiterpos+1))
	end

	if type(headervalue) == "string" then
		stdnse.print_debug(4, "serverspy: Extracted header value %s", headervalue)
		return headervalue
	end
end

function get_realm(headerline)
	if type(headerline) == "string" then
		return string.match(headerline, 'realm="(.-)"')
	end
end

--
-- Fingerprint Collection
--

function analyze_header_order(rawheader)
	local headerorder = ""	-- String of header values
	local delimiterpos = 0	-- Delimiter position
	local headername = ""	-- Name of header line

	if type(rawheader) == "table" then
		for i=1, #rawheader, 1 do
			delimiterpos = string.find(rawheader[i], ":")

			if type(delimiterpos) == "number" and delimiterpos > 0 then
				headername = string.sub(rawheader[i], 1, delimiterpos-1)

				if type(headername) == "string" then
					headerorder = headerorder .. headername

					if rawheader[i+1] ~= nil and rawheader[i+1] ~= "" then
						headerorder = headerorder .. ","
					end
				end
			end
		end
	end
	stdnse.print_debug(3, "serverspy: Get header order %s", headerorder)

	return headerorder
end

function get_quotes(headerline)
	local doublequotes = ""
	local singlequotes = ""

	doublequotes = string.find(headerline, '"')
	singlequotes = string.find(singlequotes, "'")

	if doublequotes == "number" and doublequotes ~= "" then
		return '"'
	elseif singlequotes == "number" and singlequotes ~= "" then
		return "'"
	else
		return ""
	end
end

function has_capital(str)
	if str ~= nil then
		if string.lower(str) == str then
			return 0
		else
			return 1
		end
	else
		return ""
	end
end

function capital_after_dash(str)
	local dashpos = string.find(str, "-", 1, true)

	if dashpos ~= nil then
		local afterdash = string.sub(str, dashpos+1, dashpos+1)

		if afterdash ~= nil and string.upper(afterdash) == afterdash then
			return 1
		elseif afterdash ~= nil and string.lower(afterdash) == afterdash then
			return 0
		end
	else
		return ""
	end
end

function header_space(rawheader)
	if rawheader ~= nil then
		for i=1, #rawheader, 1 do
			if string.find(rawheader[i], ": ", 1, true) then
				return 1
			end
		end
	end

	return 0
end

function vary_delimiter(str)
	if string.find(str, ", ") then
		return ", "
	elseif string.find(str, ",") then
		return ","
	else
		return ""
	end
end

--
-- Basic Functions
--

function trim(string)
      return string.gsub(string, "^%s*(.-)%s*$", "%1")
end

function in_array(array, find)
	for i=1, #array, 1 do
		if array[i].matchname == find then
			return i
		end
	end
end

function read_from_file(file)
	local filepath = nmap.fetchfile(file)

	if not filepath then
		stdnse.print_debug(1, "serverspy: File %s not found", file)
		return ""
	end

	local f, err, _ = io.open(filepath, "r")
	if not f then
		stdnse.print_debug(1, "serverspy: Failed to open file %s", file)
		return ""
	end

	local line, ret = nil, {}
	while true do
		line = f:read()
		if not line then break end
		ret[#ret+1] = line
	end

	f:close()

	return ret
end
