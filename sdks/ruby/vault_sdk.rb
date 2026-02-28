require 'net/http'
require 'json'
require 'uri'

class VaultClient
  def initialize(base_url, api_key, wallet)
    @base_url = base_url.chomp('/')
    @api_key = api_key
    @wallet = wallet
  end

  def list_files
    uri = URI.parse("#{@base_url}/api/files")
    request = Net::HTTP::Get.new(uri)
    set_headers(request)
    
    response = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }
    JSON.parse(response.body)
  end

  def upload(file_path, folder_id = 0)
    uri = URI.parse("#{@base_url}/api/upload?folder_id=#{folder_id}")
    request = Net::HTTP::Post::Multipart.new(uri.path, {
      "file" => UploadIO.new(File.open(file_path), "application/octet-stream", File.basename(file_path))
    })
    set_headers(request)
    
    response = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }
    JSON.parse(response.body)
  end

  def create_folder(name, parent_id = 0)
    uri = URI.parse("#{@base_url}/api/folders")
    request = Net::HTTP::Post.new(uri)
    request.body = { name: name, parent_id: parent_id }.to_json
    request["Content-Type"] = "application/json"
    set_headers(request)
    
    response = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }
    JSON.parse(response.body)
  end

  def list_folders
    uri = URI.parse("#{@base_url}/api/folders")
    request = Net::HTTP::Get.new(uri)
    set_headers(request)
    
    response = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }
    JSON.parse(response.body)
  end

  def list_versions(file_id)
    uri = URI.parse("#{@base_url}/api/files/#{file_id}/versions")
    request = Net::HTTP::Get.new(uri)
    set_headers(request)
    
    response = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }
    JSON.parse(response.body)
  end

  def restore_version(file_id, version_id)
    uri = URI.parse("#{@base_url}/api/files/#{file_id}/restore/#{version_id}")
    request = Net::HTTP::Post.new(uri)
    set_headers(request)
    
    response = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(request) }
    JSON.parse(response.body)
  end

  private

  def set_headers(request)
    request['Authorization'] = "Bearer #{@api_key}"
    request['X-Wallet-Address'] = @wallet
  end
end
