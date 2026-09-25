# frozen_string_literal: true

require 'rails_helper'

RSpec.describe 'Api::V1::Portfolios', type: :request do
  let!(:tenant_a) do
    Organization.find_by(scheme: 'tenant_a') || Organization.create!(
      name: 'Tenant Alpha',
      scheme: 'tenant_a',
      identifier: 'tenant-a-111',
      host: 'alpha.rakamin.com'
    )
  end

  let!(:tenant_b) do
    Organization.find_by(scheme: 'tenant_b') || Organization.create!(
      name: 'Tenant Beta',
      scheme: 'tenant_b',
      identifier: 'tenant-b-222',
      host: 'beta.rakamin.com'
    )
  end

  let(:assessor_a_token) do
    JsonWebToken.encode(user_id: 10, role: 'assessor', scheme: tenant_a.scheme)
  end

  let(:assessor_b_token) do
    JsonWebToken.encode(user_id: 20, role: 'assessor', scheme: tenant_b.scheme)
  end

  let(:headers_a) do
    {
      'Authorization' => "Bearer #{assessor_a_token}",
      'Content-Type'  => 'application/json'
    }
  end

  let(:headers_b) do
    {
      'Authorization' => "Bearer #{assessor_b_token}",
      'Content-Type'  => 'application/json'
    }
  end

  let!(:assessment_a) do
    Current.organization = tenant_a
    Current.tenant_id = tenant_a.id
    Assessment.create!(
      name: 'Alpha Engineering Assessment',
      time_limit_min: 45,
      tenant_id: tenant_a.id,
      created_by: 10
    )
  ensure
    Current.clear
  end

  let!(:session_a) do
    Current.organization = tenant_a
    Current.tenant_id = tenant_a.id
    assessment_a.sessions.create!(
      tenant_id: tenant_a.id,
      candidate_id: 101,
      candidate_name: 'Alpha Candidate',
      status: 'ended'
    )
  ensure
    Current.clear
  end

  let!(:portfolio_a) do
    Current.organization = tenant_a
    Current.tenant_id = tenant_a.id
    Portfolio.create!(
      session_id: session_a.id,
      tenant_id: tenant_a.id,
      candidate_id: 101,
      generation_status: 'complete',
      generated_at: Time.current
    )
  ensure
    Current.clear
  end

  describe 'GET /api/v1/sessions/:id/portfolio (Finding F-1: Multi-tenant portfolio isolation)' do
    it 'allows assessor from same tenant (Tenant A) to view the candidate portfolio' do
      get "/api/v1/sessions/#{session_a.id}/portfolio", headers: headers_a

      expect(response).to have_http_status(:ok)
      json = JSON.parse(response.body)
      expect(json['portfolio']['id']).to eq(portfolio_a.id)
      expect(json['portfolio']['candidate_name']).to eq('Alpha Candidate')
    end

    it 'strictly prevents assessor or candidate from another tenant (Tenant B) from accessing Tenant A portfolio' do
      get "/api/v1/sessions/#{session_a.id}/portfolio", headers: headers_b

      # Scoped to Tenant B, session from Tenant A is not found
      expect(response).to have_http_status(:not_found)
    end
  end
end
